import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

let supabaseAdminInstance: SupabaseClient<Database> | null = null

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin credentials')
  }

  supabaseAdminInstance = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return supabaseAdminInstance
}
