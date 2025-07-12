import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleSupabaseClient } from '@/lib/supabase';
import { auth } from '../../../../auth';

const supabase = getServiceRoleSupabaseClient();

// POST /api/scan/gift - Process gift QR code scan
export async function POST(request: NextRequest) {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { qrData, volunteerId } = await request.json();
    
    // Parse QR data
    let qrInfo;
    try {
      qrInfo = JSON.parse(qrData);
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid QR code format',
          scanTime: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Validate QR data structure
    if (qrInfo.type !== 'gift' || !qrInfo.userId || !qrInfo.giftCode) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid gift QR code',
          scanTime: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Find participant by email
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('*')
      .eq('email', qrInfo.userId)
      .single();
    
    if (participantError || !participant) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Participant not found',
          scanTime: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    // Check if gift already collected
    const { data: giftLog, error: giftLogError } = await supabase
      .from('gift_logs')
      .select('*')
      .eq('participant_id', participant.id as string)
      .eq('gift_code', qrInfo.giftCode)
      .single();

    if (giftLog) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Gift already collected',
          scanTime: new Date().toISOString()
        },
        { status: 409 }
      );
    }

    // Log gift collection
    const { error: giftError } = await supabase
      .from('gift_logs')
      .insert([{
        participant_id: participant.id as string,
        volunteer_id: volunteerId || user.email,
        gift_code: qrInfo.giftCode,
        collected_at: new Date().toISOString(),
        status: 'collected'
      }]);

    if (giftError) {
      console.error('Gift log error:', giftError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to log gift collection',
          scanTime: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    // Log the scan
    const { error: logError } = await supabase
      .from('scan_logs')
      .insert([{
        participant_id: participant.id as string,
        volunteer_id: volunteerId || user.email,
        scan_type: 'gift',
        status: 'success',
        message: `Gift collected for ${participant.name}`,
        qr_data: qrData
      }]);

    if (logError) {
      console.error('Log error:', logError);
    }

    // Create scan result
    const scanResult = {
      participantId: participant.id as string,
      participantName: participant.name,
      participantEmail: participant.email,
      giftCode: qrInfo.giftCode,
      scanTime: new Date().toISOString(),
      status: 'success' as const,
      message: `Gift collected for ${participant.name}`,
      volunteerId: volunteerId || user.email,
      scanType: 'gift'
    };

    return NextResponse.json({
      success: true,
      scanResult,
      participant
    });

  } catch (error) {
    console.error('Gift scan error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process gift scan',
        scanTime: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 