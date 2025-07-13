import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  const TEABLE_API_KEY = process.env.TEABLE_API_KEY;
  const TEABLE_USERS_TABLE_ID = process.env.TEABLE_USERS_TABLE_ID;
  
  if (!TEABLE_API_KEY) {
    return NextResponse.json({ error: 'Missing TEABLE_API_KEY' }, { status: 500 });
  }
  
  if (!TEABLE_USERS_TABLE_ID) {
    return NextResponse.json({ error: 'Missing TEABLE_USERS_TABLE_ID' }, { status: 500 });
  }

  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);
    
    const url = new URL(`https://app.teable.io/api/table/${TEABLE_USERS_TABLE_ID}/record`);
    const params_filter = {
      fieldKeyType: "name",
      filter: JSON.stringify({
        "conjunction": "and",
        "filterSet": [
          {
            "fieldId": "email",
            "operator": "is",
            "value": decodedEmail
          }
        ]
      })
    };

    Object.entries(params_filter).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${TEABLE_API_KEY}`,
        "Accept": "application/json"
      }
    });

    const result = await response.json();
    // console.log("Teable response:", JSON.stringify(result, null, 2));
    
    if (response.ok && result.records && result.records.length > 0) {
      // console.log(result.records);
      return NextResponse.json({ 
        user: result.records[0]
      });
    } else {
      return NextResponse.json({ 
        error: 'User not found'
      }, { status: 404 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in users API:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 