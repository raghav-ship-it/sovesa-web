# QR Scanner Integration Implementation Guide

This guide provides step-by-step instructions for replacing the `simulateScan` function with real QR scanner integration and backend API verification.

## Overview

The implementation includes:
- Real QR code scanning using camera
- Backend API endpoints for attendance and gift scanning
- Database schema for tracking scans and gifts
- Error handling and user feedback
- Success popups when scans are completed

## Step-by-Step Implementation

### Step 1: Database Setup

1. **Run the database schema** in your Supabase project:
   ```sql
   -- Execute the contents of database_schema.sql
   ```

2. **Verify tables are created**:
   - `participants` - stores participant information
   - `scan_logs` - logs all QR scan attempts
   - `gift_logs` - tracks gift collections
   - `volunteers` - volunteer information

### Step 2: API Endpoints

The following API endpoints have been created:

#### `/api/scan/attendance` (POST)
- **Purpose**: Process attendance QR code scans
- **Input**: `{ qrData: string, volunteerId?: string }`
- **Output**: Success/failure with participant details
- **Features**:
  - Validates QR code format
  - Checks participant registration
  - Prevents duplicate scans
  - Logs scan activity

#### `/api/scan/gift` (POST)
- **Purpose**: Process gift QR code scans
- **Input**: `{ qrData: string, volunteerId?: string }`
- **Output**: Success/failure with gift collection details
- **Features**:
  - Validates gift QR code format
  - Prevents duplicate gift collections
  - Logs gift collection activity

### Step 3: API Service Integration

The `scanApi` object in `frontend/lib/api.ts` now includes:

```typescript
// Process attendance QR code scan
async processAttendanceScan(qrData: string, volunteerId?: string): Promise<ApiResponse<any>>

// Process gift QR code scan
async processGiftScan(qrData: string, volunteerId?: string): Promise<ApiResponse<any>>
```

### Step 4: QR Scanner Component

A new `QRCodeScanner` component has been created with:
- Camera access for real QR scanning
- Error handling for invalid QR codes
- Type validation (attendance vs gift)
- Visual feedback during scanning

### Step 5: Success Page Integration

The success page now includes:
- Real QR scanner integration
- API calls to backend endpoints
- Error handling and user feedback
- Success popups for completed scans

## Key Features

### QR Code Format
QR codes contain JSON data with the following structure:

**Attendance QR:**
```json
{
  "type": "attendance",
  "userId": "user@email.com",
  "timestamp": 1640995200000,
  "event": "Janmashtami 2025"
}
```

**Gift QR:**
```json
{
  "type": "gift",
  "userId": "user@email.com",
  "timestamp": 1640995200000,
  "giftCode": "GIFT-ABC12345"
}
```

### Error Handling
- Invalid QR code format
- Participant not found
- Already scanned/collected
- Network errors
- Camera access issues

### Security Features
- Row Level Security (RLS) policies
- Service role authentication for updates
- Input validation and sanitization
- Audit logging of all scan activities

## Usage Instructions

### For Participants:
1. Open the success page after registration
2. Click "Show QR Code" for attendance or gift
3. Click "Start Scanning" to activate camera
4. Point camera at the QR code
5. Wait for success confirmation

### For Volunteers:
1. Use the volunteer scanning interface
2. Scan participant QR codes
3. View real-time scan results
4. Access scan statistics

## Testing

### Manual Testing:
1. **Generate QR Codes**: Use the success page to generate test QR codes
2. **Scan Testing**: Use a second device to scan the generated QR codes
3. **Error Testing**: Try invalid QR codes to test error handling
4. **Duplicate Testing**: Try scanning the same QR code twice

### Automated Testing:
```typescript
// Example test for attendance scan
const testAttendanceScan = async () => {
  const qrData = JSON.stringify({
    type: 'attendance',
    userId: 'test@example.com',
    timestamp: Date.now(),
    event: 'Janmashtami 2025'
  });
  
  const result = await scanApi.processAttendanceScan(qrData);
  console.log('Scan result:', result);
};
```

## Database Queries

### Check Scan Statistics:
```sql
SELECT 
  COUNT(*) as total_participants,
  COUNT(CASE WHEN status = 'scanned' THEN 1 END) as scanned_count,
  COUNT(CASE WHEN status = 'registered' THEN 1 END) as registered_count
FROM participants 
WHERE event = 'Janmashtami 2025';
```

### View Recent Scans:
```sql
SELECT 
  sl.created_at,
  sl.scan_type,
  sl.status,
  p.name as participant_name,
  sl.volunteer_id
FROM scan_logs sl
JOIN participants p ON sl.participant_id = p.id
ORDER BY sl.created_at DESC
LIMIT 10;
```

### Check Gift Collections:
```sql
SELECT 
  gl.collected_at,
  p.name as participant_name,
  gl.gift_code,
  gl.volunteer_id
FROM gift_logs gl
JOIN participants p ON gl.participant_id = p.id
ORDER BY gl.collected_at DESC;
```

## Troubleshooting

### Common Issues:

1. **Camera Not Working**:
   - Check browser permissions
   - Ensure HTTPS is enabled (required for camera access)
   - Try refreshing the page

2. **QR Code Not Scanning**:
   - Ensure QR code is well-lit
   - Hold camera steady
   - Check QR code format is correct

3. **API Errors**:
   - Check network connection
   - Verify Supabase credentials
   - Check database permissions

4. **Database Errors**:
   - Run database schema setup
   - Check RLS policies
   - Verify table structure

### Debug Mode:
Enable debug logging by adding to your environment:
```bash
NEXT_PUBLIC_DEBUG_SCANNER=true
```

## Performance Optimization

1. **QR Code Generation**: Refresh every 10 seconds for security
2. **Database Indexes**: Added for faster queries
3. **Error Caching**: Prevents repeated failed requests
4. **Camera Optimization**: Automatic focus and exposure

## Security Considerations

1. **QR Code Security**: Time-based expiration prevents replay attacks
2. **Input Validation**: All QR data is validated before processing
3. **Audit Logging**: All scan activities are logged for security
4. **Access Control**: RLS policies prevent unauthorized access
5. **Rate Limiting**: Consider implementing rate limiting for API endpoints

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live scan updates
2. **Offline Support**: Cache QR codes for offline scanning
3. **Analytics Dashboard**: Real-time scan statistics and charts
4. **Multi-language Support**: Internationalization for different languages
5. **Advanced Security**: Biometric verification for high-security events

## Support

For technical support or questions about the implementation:
1. Check the troubleshooting section above
2. Review the database schema and API documentation
3. Test with the provided examples
4. Contact the development team for additional assistance 