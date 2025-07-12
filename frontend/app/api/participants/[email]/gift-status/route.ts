import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleSupabaseClient } from '@/lib/supabase';
import { auth } from '../../../../../auth';

const supabase = getServiceRoleSupabaseClient();

// GET /api/participants/[email]/gift-status - Check gift collection status
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
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('id')
      .eq('email', email)
      .eq('event', 'Janmashtami 2025')
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Participant not found',
        },
        { status: 404 }
      );
    }

    // Check if participant has collected any gifts
    const { data: giftLogs, error: giftError } = await supabase
      .from('gift_logs')
      .select('*')
      .eq('participant_id', participant.id as string)
      .eq('status', 'collected');

    if (giftError) {
      console.error('Gift log error:', giftError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to check gift status'
        },
        { status: 500 }
      );
    }

    // Return gift collection status
    const hasCollectedGift = giftLogs && giftLogs.length > 0;
    const giftCollectionData = hasCollectedGift ? giftLogs[0] : null;

    return NextResponse.json({
      success: true,
      data: {
        hasCollectedGift,
        giftCollectionData,
        participantId: participant.id
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check gift collection status'
      },
      { status: 500 }
    );
  }
} 