'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import Modal from '../../components/Modal';
import { scanApi } from '../../lib/api';
import styles from './success.module.css';

export default function SuccessPage() {
  const { data: session } = useSession();
  const [attendanceData, setAttendanceData] = useState('');
  const [giftData, setGiftData] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [waitingForScan, setWaitingForScan] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [waitingForGiftScan, setWaitingForGiftScan] = useState(false);
  const [showScanSuccess, setShowScanSuccess] = useState(false);
  const [showGiftScanSuccess, setShowGiftScanSuccess] = useState(false);

  // Generate QR data
  const generateAttendanceData = () => {
    const data = JSON.stringify({
      type: 'attendance',
      userId: session?.user?.email,
      timestamp: Date.now(),
      event: 'Janmashtami 2025'
    });
    setAttendanceData(data);
  };

  const generateGiftData = () => {
    const data = JSON.stringify({
      type: 'gift',
      userId: session?.user?.email,
      timestamp: Date.now(),
      giftCode: `GIFT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    });
    setGiftData(data);
  };

  // Auto-refresh QR data every 10 seconds
  useEffect(() => {
    if (showModal) {
      generateAttendanceData();
      const interval = setInterval(generateAttendanceData, 10000);
      return () => clearInterval(interval);
    }
  }, [showModal, session?.user?.email]);







  const handleShowModal = () => {
    setShowModal(true);
    setWaitingForScan(true);
  };

  const handleShowGiftModal = () => {
    setShowGiftModal(true);
    setWaitingForGiftScan(true);
  };

  // Check if participant has been scanned
  const checkScanStatus = async () => {
    if (!session?.user?.email) return;
    
    try {
      // Check if participant exists and has been scanned
      const response = await fetch(`/api/participants/${encodeURIComponent(session.user.email)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const participant = data.data;
          
          // Check attendance scan status
          if (participant.status === 'scanned' && !showScanSuccess) {
            setShowScanSuccess(true);
            setTimeout(() => setShowScanSuccess(false), 3000);
          }
          
          // Check gift scan status (this would need a separate API endpoint)
          // For now, we'll just show a generic success message
        }
      }
    } catch (error) {
      // Silently handle errors - participant might not be scanned yet
      console.log('Checking scan status...');
    }
  };

  // Check scan status every 5 seconds when modals are open
  useEffect(() => {
    if (showModal || showGiftModal) {
      const interval = setInterval(checkScanStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [showModal, showGiftModal, attendanceData, giftData, session?.user?.email]);

  // Auto-close modals after 15 seconds
  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        setShowModal(false);
        setWaitingForScan(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [showModal]);

  useEffect(() => {
    if (showGiftModal) {
      const timer = setTimeout(() => {
        setShowGiftModal(false);
        setWaitingForGiftScan(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [showGiftModal]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.successPage}>
      <div className={styles.container}>
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: 'spring' }}
          className={styles.header}
        >
          <div className={styles.successIcon}><span>✅</span></div>
          <h1 className={styles.title}>Registration Successful!</h1>
          <p className={styles.subtitle}>Welcome to Janmashtami 2025</p>
          <p className={styles.info}>Your ticket has been generated successfully</p>
        </motion.div>

        {/* Ticket Information */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={styles.ticketInfo}
        >
          <h2 className={styles.sectionTitle}>Your Ticket</h2>
          <div className={`${styles.ticketGrid} flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-8`}>
            <div className={styles.participantDetails}>
              <h3 className={styles.sectionSubtitle}>Participant Details</h3>
              <div className={styles.detailsList}>
                <div><strong>Name:</strong> {session.user?.name}</div>
                <div><strong>Email:</strong> {session.user?.email}</div>
                {/* Ticket ID removed */}
                <div><strong>Event:</strong> Janmashtami 2025</div>
                <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
              </div>
            </div>
            <div className={styles.eventInfo}>
              <h3 className={styles.sectionSubtitle}>Event Information</h3>
              <div className={styles.detailsList}>
                <div><strong>Venue:</strong> Temple Grounds</div>
                <div><strong>Time:</strong> 6:00 PM onwards</div>
                <div><strong>Dress Code:</strong> Traditional Indian</div>
                <div><strong>Entry:</strong> Free</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* QR Code Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className={styles.qrGrid}>
          {/* Attendance QR */}
          <div className={styles.qrBlock}>
            <div className={styles.qrIcon}><span>📱</span></div>
            <h3 className={styles.sectionSubtitle}>Mark Attendance</h3>
            <p className={styles.qrDesc}>Show this QR code to the volunteer to mark your attendance</p>
            <button
              onClick={handleShowModal}
              className={styles.attendanceButton}
            >
              Show QR Code
            </button>
          </div>
          {/* Gift QR */}
          <div className={styles.qrBlock}>
            <div className={styles.qrIconGift}><span>🎁</span></div>
            <h3 className={styles.sectionSubtitle}>Receive Gift</h3>
            <p className={styles.qrDescGift}>Show this QR code to collect your special gift</p>
            <button
              onClick={handleShowGiftModal}
              className={styles.giftButton}
            >
              Show Gift QR Code
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className={styles.navigation}>
          <button
            onClick={() => window.print()}
            className={styles.printButton}
          >
            📄 Print Ticket
          </button>
          <button
            onClick={() => window.location.href = '/events'}
            className={styles.eventsButton}
          >
            📅 View Events
          </button>
        </div>

        {/* Attendance QR Modal */}
        <Modal open={showModal} onClose={() => setShowModal(false)} title="Your Attendance QR Code">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={styles.modalContent}
          >
            <div className={styles.festiveIcon}>🕉️</div>
            <h2 className={styles.modalTitle}>Your Attendance QR Code</h2>
            <QRCodeSVG value={attendanceData} size={192} bgColor="#fff" fgColor="#000" />
            <button
              onClick={generateAttendanceData}
              className={styles.refreshButton}
            >
              <span>🔄</span> Refresh QR Code
            </button>
            <p className={styles.attendanceInfo}>Show this QR code at the event entrance.</p>
            {waitingForScan && (
              <div className={styles.waitingMsg}>Waiting for scan...</div>
            )}
          </motion.div>
        </Modal>

        {/* Gift QR Modal */}
        <Modal open={showGiftModal} onClose={() => setShowGiftModal(false)} title="Your Gift QR Code" accent="purple">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={styles.modalContent}
          >
            <div className={styles.festiveIcon}>🕉️</div>
            <h2 className={styles.modalTitle}>Your Gift QR Code</h2>
            <QRCodeSVG value={giftData} size={192} bgColor="#fff" fgColor="#000" />
            <button
              onClick={generateGiftData}
              className={styles.giftButton}
            >
              <span>🔄</span>  Refresh QR Code
            </button>
            <p className={styles.attendanceInfo}>Show this QR code to collect your gift.</p>
            {waitingForGiftScan && (
              <div className={styles.waitingMsg}>Waiting for scan...</div>
            )}
          </motion.div>
        </Modal>

        {/* Scan Success Popup */}
        {showScanSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="bg-black bg-opacity-50 absolute inset-0"></div>
            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4 relative z-10">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Attendance Marked!</h3>
              <p className="text-gray-600">Your attendance has been successfully recorded.</p>
            </div>
          </motion.div>
        )}

        {/* Gift Scan Success Popup */}
        {showGiftScanSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="bg-black bg-opacity-50 absolute inset-0"></div>
            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4 relative z-10">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Gift Collected!</h3>
              <p className="text-gray-600">Your special gift has been successfully collected.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 