import { getServiceRoleSupabaseClient } from '@/lib/supabase';
import { auth } from "@/auth.js";

const supabase = getServiceRoleSupabaseClient();

export async function GET(request: Request) {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    return new Response(JSON.stringify({ isVolunteer: false }), { status: 200 });
  }
  const { email } = user;
  const { data, error } = await supabase
    .from('volunteers')
    .select('email')
    .eq('email', email)
    .single();
  if (error || !data) {
    return new Response(JSON.stringify({ isVolunteer: false }), { status: 200 });
  }
  return new Response(JSON.stringify({ isVolunteer: true }), { status: 200 });
} 