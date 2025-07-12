import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleSupabaseClient } from '@/lib/supabase';
import { auth } from '../../../../auth';

const supabase = getServiceRoleSupabaseClient();

// GET /api/participants/[email] - Get participant status by email
export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  const session = await auth();
  const user = session?.user;
  
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const email = decodeURIComponent(params.email);
    
    // Get participant by email
    const { data: participant, error } = await supabase
      .from('participants')
      .select('*')
      .eq('email', email)
      .eq('event', 'Janmashtami 2025')
      .single();

    if (error || !participant) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Participant not found',
        },
        { status: 404 }
      );
    }

    // Transform participant data
    const transformedParticipant = {
      id: participant.id,
      name: participant.name,
      email: participant.email,
      phone: participant.phone,
      event: participant.event,
      status: participant.status,
      registered_at: participant.registered_at,
      scanned_at: participant.scanned_at,
      scanned_by: participant.scanned_by,
    };

    return NextResponse.json({
      success: true,
      data: transformedParticipant
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch participant status'
      },
      { status: 500 }
    );
  }
} 