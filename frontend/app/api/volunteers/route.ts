import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleSupabaseClient } from '@/lib/supabase';
import { auth } from "@/auth.js";

const supabase = getServiceRoleSupabaseClient();

// GET /api/volunteers - Get all volunteers
export async function GET(request: Request) {
  try {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch volunteers' },
        { status: 500 }
      );
    }

    return NextResponse.json({ volunteers: data || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch volunteers' },
      { status: 500 }
    );
  }
}

// POST /api/volunteers - Create new volunteer
export async function POST(request: NextRequest) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { phone } = await request.json();
  const { id, name, email } = user;

  const { data, error } = await supabase
    .from('volunteers')
    .upsert([
      {
        name,
        email,
        phone,
        status: 'active',
      },
    ], { onConflict: 'email' });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 201 });
} 