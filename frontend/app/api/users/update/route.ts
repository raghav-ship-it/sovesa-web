import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  const TEABLE_API_KEY = process.env.TEABLE_API_KEY;
  const TEABLE_USERS_TABLE_ID = process.env.TEABLE_USERS_TABLE_ID;
  
  if (!TEABLE_API_KEY) {
    return NextResponse.json({ error: 'Missing TEABLE_API_KEY' }, { status: 500 });
  }
  
  if (!TEABLE_USERS_TABLE_ID) {
    return NextResponse.json({ error: 'Missing TEABLE_USERS_TABLE_ID' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { email, name, phone, student_id } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // First, find the user record by email
    const findUrl = new URL(`https://app.teable.io/api/table/${TEABLE_USERS_TABLE_ID}/record`);
    const params_filter = {
      fieldKeyType: "name",
      filter: JSON.stringify({
        "conjunction": "and",
        "filterSet": [
          {
            "fieldId": "email",
            "operator": "is",
            "value": email
          }
        ]
      })
    };

    Object.entries(params_filter).forEach(([key, value]) => {
      findUrl.searchParams.append(key, value);
    });

    console.log("Find user URL:", findUrl.toString());

    const findResponse = await fetch(findUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${TEABLE_API_KEY}`,
        "Accept": "application/json"
      }
    });

    const findResult = await findResponse.json();
    console.log("Find user response:", JSON.stringify(findResult, null, 2));
    
    if (!findResponse.ok || !findResult.records || findResult.records.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userRecord = findResult.records[0];
    const recordId = userRecord.id;

    // Prepare update payload - only update the fields that are provided
    const updateFields: Record<string, unknown> = {};
    
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (student_id !== undefined) updateFields.studentId = student_id;

    console.log("Updating fields:", updateFields);

    // Update the record using record ID
    const updateUrl = `https://app.teable.io/api/table/${TEABLE_USERS_TABLE_ID}/record/${recordId}`;
    
    const updatePayload = {
      fieldKeyType: 'name',
      typecast: true,
      record: {
        fields: updateFields,
      }
    };

    console.log("Update payload:", JSON.stringify(updatePayload, null, 2));

    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${TEABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });
    
    const updateResult = await updateResponse.json();
    console.log("Update response:", JSON.stringify(updateResult, null, 2));
    
    if (updateResponse.ok) {
      return NextResponse.json({ 
        message: 'User data updated successfully!',
        updatedFields: Object.keys(updateFields)
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to update user data', 
        details: updateResult 
      }, { status: updateResponse.status });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in update API:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 