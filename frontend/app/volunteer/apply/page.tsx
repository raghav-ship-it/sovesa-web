"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const duties = [
  { id: "scanning", title: "Scanning Desk Management" },
  { id: "registration", title: "Registration Desk" },
  { id: "food", title: "Food Distribution" },
  { id: "programs", title: "Cultural Programs Assistance" },
];

export default function VolunteerApplyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    student_id: "",
    experience: "",
    preferred_role: "",
    availability: "",
    motivation: ""
  });

  // Update form data when session changes
  useEffect(() => {
    const userName = session?.user?.name;
    const userEmail = session?.user?.email;
    if (userName && userEmail) {
      setFormData(prev => ({
        ...prev,
        name: userName,
        email: userEmail
      }));
    }
  }, [session]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/volunteer-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
          router.push("/");
        }, 1500); // 1.5 seconds
      } else {
        alert(data.error || "Failed to submit application. Please try again.");
      }
    } catch (error) {
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-black bg-opacity-50 absolute inset-0"></div>
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4 relative z-10">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Application Submitted!</h2>
            <p className="text-gray-600">Thank you for applying to volunteer.<br />You will be redirected to the homepage.</p>
          </div>
        </div>
      )}
      <div className="bg-white/10 p-8 rounded-xl w-full max-w-2xl space-y-6">
        {success && (
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Your application has been received!</h2>
            <p className="text-blue-200">The admin will review it soon.</p>
            <p className="text-blue-200 mt-4">You will be notified once your application is reviewed.</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Volunteer Application</h2>
          
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-200 mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                readOnly
                className="w-full p-2 rounded bg-white/10 text-gray-300 cursor-not-allowed"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-blue-200 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="w-full p-2 rounded bg-white/10 text-gray-300 cursor-not-allowed"
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label className="block text-blue-200 mb-2">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full p-2 rounded bg-white/20 text-white"
                placeholder="10-digit phone number"
              />
            </div>
            <div>
              <label className="block text-blue-200 mb-2">Student ID</label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-white/20 text-white"
                placeholder="Your student ID (optional)"
              />
            </div>
          </div>

          {/* Role and Availability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-200 mb-2">Preferred Role *</label>
              <select
                name="preferred_role"
                value={formData.preferred_role}
                onChange={handleInputChange}
                required
                className="w-full p-2 rounded bg-white/20 text-white"
              >
                <option value="" disabled>Select a role</option>
                {duties.map(d => (
                  <option key={d.id} value={d.title}>{d.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-blue-200 mb-2">Availability *</label>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                required
                className="w-full p-2 rounded bg-white/20 text-white"
                placeholder="e.g., 6:00 PM - 10:00 PM"
              />
            </div>
          </div>

          {/* Experience and Motivation */}
          <div>
            <label className="block text-blue-200 mb-2">Previous Experience</label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-white/20 text-white min-h-[80px]"
              placeholder="Describe any previous volunteer experience..."
            />
          </div>

          <div>
            <label className="block text-blue-200 mb-2">Why do you want to volunteer? *</label>
            <textarea
              name="motivation"
              value={formData.motivation}
              onChange={handleInputChange}
              required
              className="w-full p-2 rounded bg-white/20 text-white min-h-[100px]"
              placeholder="Tell us why you want to volunteer for this event..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
} 