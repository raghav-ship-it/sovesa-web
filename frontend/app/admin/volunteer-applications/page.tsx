'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

interface VolunteerApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  student_id?: string;
  experience?: string;
  preferred_role?: string;
  availability?: string;
  motivation?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
}

export default function VolunteerApplicationsPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/volunteer-applications');
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.data);
      } else {
        setError(data.error || 'Failed to fetch applications');
      }
    } catch (err) {
      setError('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, status: 'approved' | 'rejected', reviewNotes?: string) => {
    try {
      const response = await fetch(`/api/volunteer-applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          review_notes: reviewNotes || ''
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh applications list
        fetchApplications();
      } else {
        setError(data.error || 'Failed to update application');
      }
    } catch (err) {
      setError('Failed to update application');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-300';
      case 'rejected': return 'bg-red-500/20 text-red-300';
      default: return 'bg-yellow-500/20 text-yellow-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-red-500/20 text-red-300 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={fetchApplications}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-sm p-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-2xl">🕉️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Volunteer Applications</h1>
              <p className="text-blue-200">Manage volunteer applications</p>
            </div>
          </div>
          <div className="text-white">
            <span className="text-sm">Total: {applications.length}</span>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Applications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {applications.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-white mb-2">No Applications Yet</h3>
              <p className="text-blue-200">Volunteer applications will appear here</p>
            </div>
          ) : (
            applications.map((application) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{application.name}</h3>
                    <p className="text-blue-200">{application.email}</p>
                    <p className="text-blue-200">{application.phone}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                    {application.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Details</h4>
                    <div className="space-y-1 text-sm text-blue-200">
                      {application.student_id && <p><strong>Student ID:</strong> {application.student_id}</p>}
                      {application.preferred_role && <p><strong>Preferred Role:</strong> {application.preferred_role}</p>}
                      {application.availability && <p><strong>Availability:</strong> {application.availability}</p>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Experience & Motivation</h4>
                    <div className="space-y-1 text-sm text-blue-200">
                      {application.experience && <p><strong>Experience:</strong> {application.experience}</p>}
                      {application.motivation && <p><strong>Motivation:</strong> {application.motivation}</p>}
                    </div>
                  </div>
                </div>

                {application.status === 'pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => updateApplicationStatus(application.id, 'approved')}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(application.id, 'rejected')}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}

                {application.status !== 'pending' && (
                  <div className="text-sm text-blue-200">
                    <p><strong>Reviewed by:</strong> {application.reviewed_by}</p>
                    <p><strong>Reviewed at:</strong> {new Date(application.reviewed_at || '').toLocaleString()}</p>
                    {application.review_notes && <p><strong>Notes:</strong> {application.review_notes}</p>}
                  </div>
                )}

                <div className="text-xs text-blue-300 mt-2">
                  Applied: {new Date(application.created_at).toLocaleString()}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
} 