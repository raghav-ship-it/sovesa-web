import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleSupabaseClient } from '@/lib/supabase';
import { auth } from "@/auth.js";

// Initialize Supabase client with service role key for admin operations
const supabase = getServiceRoleSupabaseClient();

/**
 * POST /api/volunteer-applications - Submit a volunteer application
 * Requires authentication and duty_id, reason in request body
 * Validates input and creates application with pending status
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  const user = session?.user;
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { duty_id, reason } = await request.json();
    const { name, email } = user;

    // Validate required fields from user session and request
    if (!name || !email) {
      return new Response("Missing required fields: name or email", { status: 400 });
    }

    if (!duty_id) {
      return new Response("Missing required field: duty_id", { status: 400 });
    }

    if (!reason) {
      return new Response("Missing required field: reason", { status: 400 });
    }

    // Generate unique UUID for user_id field
    const userId = crypto.randomUUID();

    // Insert volunteer application record
    const { data, error } = await supabase
      .from('volunteer_applications')
      .insert([
        {
          user_id: userId,
          name,
          email,
          duty_id,
          reason,
          status: 'pending',
        },
      ])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return new Response(`Database error: ${error.message}`, { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return new Response("Internal server error", { status: 500 });
  }
} 