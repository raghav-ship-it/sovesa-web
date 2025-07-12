import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleSupabaseClient } from '@/lib/supabase';
import { auth } from '../../../../auth';

const supabase = getServiceRoleSupabaseClient();

// POST /api/scan/attendance - Process attendance QR code scan
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
    if (qrInfo.type !== 'attendance' || !qrInfo.userId || !qrInfo.event) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid attendance QR code',
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
      .eq('event', qrInfo.event)
      .single();
    
    if (participantError || !participant) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Participant not found for this event',
          scanTime: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    // Check if already scanned
    if (participant.status === 'scanned' || participant.status === 'checked-in') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Attendance already marked',
          scanTime: new Date().toISOString()
        },
        { status: 409 }
      );
    }

    // Update participant status to scanned
    const { error: updateError } = await supabase
      .from('participants')
      .update({ 
        status: 'scanned',
        scanned_at: new Date().toISOString(),
        scanned_by: volunteerId || user.email
      })
      .eq('id', participant.id as string);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to update attendance status',
          scanTime: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    // Log the scan
    const { error: logError } = await supabase
      .from('scan_logs')
      .insert([{
        participant_id: participant.id,
        volunteer_id: volunteerId || user.email,
        scan_type: 'attendance',
        status: 'success',
        message: `Attendance marked for ${participant.name}`,
        qr_data: qrData
      }]);

    if (logError) {
      console.error('Log error:', logError);
    }

    // Create scan result
    const scanResult = {
      participantId: participant.id,
      participantName: participant.name,
      participantEmail: participant.email,
      scanTime: new Date().toISOString(),
      status: 'success' as const,
      message: `Attendance marked for ${participant.name}`,
      volunteerId: volunteerId || user.email,
      scanType: 'attendance'
    };

    return NextResponse.json({
      success: true,
      scanResult,
      participant: { ...participant, status: 'scanned' }
    });

  } catch (error) {
    console.error('Attendance scan error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process attendance scan',
        scanTime: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 