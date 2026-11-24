const { before, after, beforeEach, afterEach, test } = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { join } = require('node:path')
const { PGlite } = require('@electric-sql/pglite')

const db = new PGlite()
const memberId = '00000000-0000-4000-8000-000000000001'
const adminId = '00000000-0000-4000-8000-000000000002'
const pendingId = '00000000-0000-4000-8000-000000000003'
const newUserId = '00000000-0000-4000-8000-000000000004'

before(async () => {
  // Reproduce Supabase JWT helpers and the repository's owner/admin RLS policies.
  await db.exec(`
    CREATE ROLE authenticated;
    CREATE ROLE anon;
    CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
      SELECT (COALESCE(NULLIF(current_setting('request.jwt.claims', true), ''), '{}')::jsonb ->> 'sub')::uuid;
    $$;
    CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$
      SELECT COALESCE(NULLIF(current_setting('request.jwt.claims', true), ''), '{}')::jsonb ->> 'role';
    $$;
    CREATE TYPE public.member_status AS ENUM ('pending', 'active', 'rejected');
    CREATE TABLE public.member_profiles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid UNIQUE NOT NULL,
      display_name text NOT NULL,
      status public.member_status DEFAULT 'pending',
      position text
    );
    ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;
    GRANT USAGE ON SCHEMA public, auth TO authenticated, anon;
    GRANT ALL ON public.member_profiles TO authenticated, anon;
    CREATE POLICY allow_own_read ON public.member_profiles FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY allow_own_update ON public.member_profiles FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY allow_own_insert ON public.member_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
  `)
  const migration = readFileSync(join(__dirname, '../../supabase/migrations/00027_protect_member_permissions.sql'), 'utf8')
  await db.exec(migration)
  // Migration remains safe to retry.
  await db.exec(migration)
  await db.exec(`
    CREATE POLICY allow_admin_all ON public.member_profiles
      FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
    INSERT INTO public.member_profiles (user_id, display_name, status, position) VALUES
      ('${memberId}', 'Member', 'active', '부원'),
      ('${adminId}', 'Admin', 'active', '운영진'),
      ('${pendingId}', 'Pending executive', 'pending', '운영진');
  `)
})
after(async () => db.close())
beforeEach(async () => db.exec('BEGIN'))
afterEach(async () => db.exec('ROLLBACK'))

async function signIn(id) {
  await db.query("SELECT set_config('request.jwt.claims', $1, true)", [JSON.stringify({ sub: id, role: 'authenticated' })])
  await db.exec('SET LOCAL ROLE authenticated')
}

test('members can edit ordinary profile fields', async () => {
  await signIn(memberId)
  const { rows } = await db.query("UPDATE public.member_profiles SET display_name = 'Updated' WHERE user_id = $1 RETURNING display_name", [memberId])
  assert.equal(rows[0].display_name, 'Updated')
})

for (const assignment of ["position = '회장'", "status = 'active'", `user_id = '${newUserId}'`, 'id = gen_random_uuid()']) {
  test(`members cannot change permission fields: ${assignment}`, async () => {
    // A pending account also tests the approval bypass.
    await signIn(pendingId)
    await assert.rejects(db.exec(`UPDATE public.member_profiles SET ${assignment} WHERE user_id = '${pendingId}'`), { code: '42501' })
  })
}

test('new users can create pending member profiles', async () => {
  await signIn(newUserId)
  const { rows } = await db.query("INSERT INTO public.member_profiles (user_id, display_name) VALUES ($1, 'New') RETURNING status", [newUserId])
  assert.equal(rows[0].status, 'pending')
})

for (const [status, position] of [['active', '부원'], ['pending', '회장'], [null, '부원']]) {
  test(`new users cannot assign themselves ${status}/${position}`, async () => {
    await signIn(newUserId)
    await assert.rejects(db.query('INSERT INTO public.member_profiles (user_id, display_name, status, position) VALUES ($1, $2, $3, $4)', [newUserId, 'New', status, position]), { code: '42501' })
  })
}

test('an unapproved executive has no admin privileges', async () => {
  await signIn(pendingId)
  assert.equal((await db.query('SELECT public.is_admin() AS admin')).rows[0].admin, false)
})

test('approved admins can approve and assign roles to other profiles', async () => {
  await signIn(adminId)
  assert.equal((await db.query('SELECT public.is_admin() AS admin')).rows[0].admin, true)
  const { rows } = await db.query("UPDATE public.member_profiles SET status = 'active', position = '관리자' WHERE user_id = $1 RETURNING status, position", [pendingId])
  assert.deepEqual(rows[0], { status: 'active', position: '관리자' })
})

test('members cannot update another profile through owner RLS', async () => {
  await signIn(memberId)
  const { rows } = await db.query("UPDATE public.member_profiles SET display_name = 'Changed' WHERE user_id = $1 RETURNING id", [adminId])
  assert.equal(rows.length, 0)
})

test('anonymous callers do not acquire admin privileges', async () => {
  await db.exec('SET LOCAL ROLE anon')
  assert.equal((await db.query('SELECT public.is_admin() AS admin')).rows[0].admin, false)
})

test('trusted service-role maintenance can still assign permissions', async () => {
  await db.query("SELECT set_config('request.jwt.claims', $1, true)", [JSON.stringify({ role: 'service_role' })])
  const { rows } = await db.query("UPDATE public.member_profiles SET status = 'active', position = '회장' WHERE user_id = $1 RETURNING position", [pendingId])
  assert.equal(rows[0].position, '회장')
})
