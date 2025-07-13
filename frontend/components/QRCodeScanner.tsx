'use client';

import { useEffect, useRef, useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  isScanning: boolean;
  onError?: (error: string) => void;
  scanType?: 'attendance' | 'gift';
}

export default function QRCodeScanner({ 
  onScan, 
  isScanning, 
  onError,
  scanType = 'attendance'
}: QRCodeScannerProps) {
  const [scanningAnimation, setScanningAnimation] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (isScanning) {
      setScanningAnimation(true);
      setCameraError(null);
    } else {
      setScanningAnimation(false);
    }
  }, [isScanning]);

  const handleScanResult = (result: any) => {
    try {
      // Validate QR code format
      const qrData = JSON.parse(result);
      if (qrData.type === scanType) {
        onScan(result);
      } else {
        onError?.(`Invalid QR code type. Expected ${scanType}, got ${qrData.type}`);
      }
    } catch (error) {
      onError?.('Invalid QR code format');
    }
  };

  const handleScanError = (error: any) => {
    console.log('Scan error:', error);
    setCameraError('Camera access error. Please check permissions.');
    onError?.('Camera access error');
  };

  if (!isScanning) {
    return (
      <div className="text-center">
        <div className="w-80 h-80 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="text-6xl mb-4">📷</div>
            <div className="text-white text-lg">Scanner Ready</div>
            <div className="text-blue-200 text-sm">
              Click "Start Scanning" to begin {scanType} scan
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cameraError) {
    return (
      <div className="text-center">
        <div className="w-80 h-80 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <div className="text-red-400 text-lg">Camera Error</div>
            <div className="text-red-300 text-sm">{cameraError}</div>
            <button
              onClick={() => setCameraError(null)}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="w-80 h-80 bg-white/5 rounded-2xl border-2 border-dashed border-yellow-400 flex items-center justify-center mb-4 overflow-hidden relative">
        <div className="w-full h-full rounded-2xl overflow-hidden">
          <Scanner
            onScan={(result: any) => handleScanResult(result)}
            onError={(error) => handleScanError(error)}
          />
        </div>
        
        {/* Scanning overlay */}
        {scanningAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-2 border-yellow-400 rounded-lg animate-pulse"></div>
          </div>
        )}
      </div>
      <div className="text-white text-lg">
        Scanning for {scanType === 'attendance' ? 'Attendance' : 'Gift'} QR Code
      </div>
      <div className="text-blue-200 text-sm">Point camera at QR code</div>
    </div>
  );
} 