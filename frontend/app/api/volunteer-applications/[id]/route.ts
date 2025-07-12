import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleSupabaseClient } from '@/lib/supabase';
import { auth } from '../../../../auth';

const supabase = getServiceRoleSupabaseClient();

// PUT /api/volunteer-applications/[id] - Update volunteer application status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const user = session?.user;
  
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { status, review_notes } = await request.json();
    const applicationId = params.id;

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be pending, approved, or rejected' },
        { status: 400 }
      );
    }

    // Update volunteer application
    const { data, error } = await supabase
      .from('volunteer_applications')
      .update({
        status,
        review_notes,
        reviewed_by: user.email,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update application status' },
        { status: 500 }
      );
    }

    // If approved, create volunteer record
    if (status === 'approved' && data && data[0]) {
      const application = data[0];
      
      const { error: volunteerError } = await supabase
        .from('volunteers')
        .insert([{
          name: application.name,
          email: application.email,
          phone: application.phone,
          role: application.preferred_role || 'volunteer',
          status: 'active'
        }]);

      if (volunteerError) {
        console.error('Failed to create volunteer record:', volunteerError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: `Application ${status} successfully`
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update volunteer application' },
      { status: 500 }
    );
  }
}

// GET /api/volunteer-applications/[id] - Get specific volunteer application
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const user = session?.user;
  
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const applicationId = params.id;

    const { data, error } = await supabase
      .from('volunteer_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch volunteer application' },
      { status: 500 }
    );
  }
} 