import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleSupabaseClient } from '@/lib/supabase';
import { auth } from "@/auth.js";

const supabase = getServiceRoleSupabaseClient();

// GET /api/volunteer-applications - Get all volunteer applications
export async function GET() {
  const session = await auth();
  const user = session?.user;
  
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('volunteer_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch volunteer applications' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch volunteer applications' },
      { status: 500 }
    );
  }
}

// POST /api/volunteer-applications - Submit a new volunteer application
export async function POST(request: NextRequest) {
  const session = await auth();
  const user = session?.user;
  
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const {
      name,
      email,
      phone,
      student_id,
      experience,
      preferred_role,
      availability,
      motivation
    } = await request.json();

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Check if application already exists for this email
    const { data: existingApplication } = await supabase
      .from('volunteer_applications')
      .select('id')
      .eq('email', email)
      .single();

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Application already exists for this email' },
        { status: 409 }
      );
    }

    // Insert new application
    const { data, error } = await supabase
      .from('volunteer_applications')
      .insert([
        {
          name,
          email,
          phone,
          student_id,
          experience,
          preferred_role,
          availability,
          motivation,
          status: 'pending'
        }
      ])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data[0] }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
} 