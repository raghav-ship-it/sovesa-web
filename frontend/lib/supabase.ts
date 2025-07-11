import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton for anon/public client
let supabaseInstance: ReturnType<typeof createClient> | undefined;
export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}
export const supabase = getSupabaseClient();

// Singleton for service role client
let serviceRoleSupabaseInstance: ReturnType<typeof createClient> | undefined;
export function getServiceRoleSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!serviceRoleSupabaseInstance) {
    serviceRoleSupabaseInstance = createClient(supabaseUrl, serviceRoleKey);
  }
  return serviceRoleSupabaseInstance;
}

// Database types
export interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: string;
  address?: string;
  emergency_contact?: string;
  dietary_restrictions?: string;
  special_needs?: string;
  created_at: string;
}

export interface Volunteer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  tasks: string[];
  created_at: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  capacity: number;
  registered_count: number;
  created_at: string;
} 