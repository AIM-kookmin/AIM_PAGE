import { createClient } from '@/shared/api/supabase/server'
import { redirect } from 'next/navigation'
import AdminLayoutClient from './AdminLayoutClient'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) {
    redirect('/')
  }
  
  return (
    <AdminLayoutClient user={{ name: user.user_metadata?.name || user.email || null }}>
      {children}
    </AdminLayoutClient>
  )
}
