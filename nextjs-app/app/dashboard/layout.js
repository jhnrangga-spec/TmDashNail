import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase-server';
import Sidebar from '@/components/Sidebar';

export default async function DashboardLayout({ children }) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  const { count: pendingBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const userData = {
    fullName: profile?.full_name || user.email?.split('@')[0] || 'Admin',
    role: profile?.role || 'Administrator',
  };

  return (
    <div className="app-container">
      <Sidebar user={userData} pendingBookings={pendingBookings || 0} />
      <main className="main-content">{children}</main>
    </div>
  );
}
