"use client";

import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';

// Mock data for demonstration
const courses = [
  { id: '1', title: 'beyond birth and death', image: '/course1.jpg' },
  { id: '2', title: 'the inner algorithm', image: '/course2.jpg' },
  { id: '3', title: 'the soul walks', image: '/course3.jpg' },
];
const trips = [
  { id: '1', title: 'jaipur exploration', image: '/trip1.jpg' },
  { id: '2', title: 'the eastern journey', image: '/trip2.jpg' },
  { id: '3', title: 'to the city of Krishna', image: '/trip3.jpg' },
];
const events = [
  { id: '1', title: 'janmashtami', image: '/event1.jpg' },
  { id: '2', title: 'ramnavami', image: '/event2.jpg' },
  { id: '3', title: 'holi', image: '/event3.jpg' },
];
const bazaar = [
  { id: '1', title: 'japa mala', image: '/bazaar1.jpg' },
  { id: '2', title: 'chanting bag', image: '/bazaar2.jpg' },
  { id: '3', title: 'dhoti', image: '/bazaar3.jpg' },
];

type Item = { id: string; title: string; image: string };

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const thumbnailsVariants = {
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const thumbnailVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
};

function HorizontalScroll({ title, items, basePath, delay = 0 }: { title: string; items: Item[]; basePath: string; delay?: number }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [emblaRef] = useEmblaCarousel({ dragFree: true, containScroll: 'trimSnaps' });

  return (
    <motion.section
      ref={sectionRef}
      className="mb-8"
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={sectionVariants}
      transition={{ delay }}
      layout
    >
      <motion.div
        className="flex justify-between items-center mb-2 px-1"
        initial={{ opacity: 0, x: -30 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
        transition={{ duration: 0.5, delay: delay + 0.1 }}
        layout
      >
        <h2 className="text-lg font-bold text-green-700 drop-shadow">
          {title}
        </h2>
        <Link href={basePath} className="text-green-600 text-sm font-semibold hover:underline">See all</Link>
      </motion.div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              className="flex-shrink-0 px-2"
              // Responsive width: 120px on mobile, 180px on md+, 220px on lg+
              style={{ width: 'clamp(120px, 20vw, 220px)' }}
              whileHover={{ scale: 1.08, boxShadow: '0 4px 24px rgba(34,197,94,0.15)' }}
              whileTap={{ scale: 0.97 }}
              layout
            >
              <Link
                href={`${basePath}/${item.id}`}
                className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-green-300 rounded-lg transition-shadow"
                tabIndex={0}
              >
                <div className="rounded-xl shadow bg-white p-2 hover:bg-green-50 transition-colors duration-200">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={220}
                    height={220}
                    className="w-full h-28 md:h-36 lg:h-44 object-cover rounded-lg border border-gray-100"
                    loading="lazy"
                  />
                  <div className="mt-1 text-center text-sm font-medium text-green-800 truncate">
                    {item.title}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default function HomePage() {
  const { data: session } = useSession();
  const user = session?.user;
  const navRef = useRef(null);
  const { scrollY } = useScroll();
  // Navbar shrinks and fades as you scroll down
  const navScale = useTransform(scrollY, [0, 80], [1, 0.92]);
  const navOpacity = useTransform(scrollY, [0, 80], [1, 0.7]);
  const [showPendingPopup, setShowPendingPopup] = useState(false);

  const handleVolunteerClick = async () => {
    if (!session?.user?.email) {
      window.location.href = '/volunteer/apply';
      return;
    }
    try {
      const res = await fetch(`/api/volunteer-applications?email=${encodeURIComponent(session.user.email)}`);
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        const status = data.data[0].status;
        if (status === 'approved') {
          window.location.href = '/volunteer/dashboard';
        } else if (status === 'pending') {
          setShowPendingPopup(true);
          setTimeout(() => setShowPendingPopup(false), 2000);
        } else {
          window.location.href = '/volunteer/apply';
        }
      } else {
        window.location.href = '/volunteer/apply';
      }
    } catch {
      window.location.href = '/volunteer/apply';
    }
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* Top right profile and volunteer button */}
      <div className="absolute top-6 right-6 flex flex-col items-center z-20">
        {session?.user?.image && (
          <img
            src={session.user.image}
            alt="Profile"
            className="w-12 h-12 rounded-full border-2 border-green-600 shadow-md mb-2"
          />
        )}
        <button
          onClick={handleVolunteerClick}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg font-semibold shadow-lg transition-colors"
        >
          Volunteer
        </button>
      </div>

      {/* Main navigation bar (without Volunteer) */}
      <motion.nav
        className="flex flex-wrap gap-4 justify-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link href="/courses" className="text-green-700 font-semibold hover:text-green-900 transition">Courses</Link>
        <Link href="/trips" className="text-green-700 font-semibold hover:text-green-900 transition">Trips</Link>
        <Link href="/events" className="text-green-700 font-semibold hover:text-green-900 transition">Events</Link>
        <Link href="/bazaar" className="text-green-700 font-semibold hover:text-green-900 transition">Bazaar</Link>
      </motion.nav>

      {/* User profile picture at top right if authenticated */}
      <AnimatePresence>
        {user?.image && (
          <motion.div
            key="user-avatar"
            className="absolute top-4 right-4 z-20"
            initial={{ opacity: 0, scale: 0.7, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -20 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            layout
          >
            <Image
              src={user.image}
              alt={user.name || 'User profile'}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full border-2 border-green-500 shadow-md object-cover"
              priority
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>
      {showPendingPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-black bg-opacity-50 absolute inset-0"></div>
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4 relative z-10">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Application Pending</h2>
            <p className="text-gray-600">The admin is still reviewing your request.</p>
          </div>
        </div>
      )}
      <HorizontalScroll title="Courses" items={courses} basePath="/courses" delay={0.05} />
      <HorizontalScroll title="Trips" items={trips} basePath="/trips" delay={0.15} />
      <HorizontalScroll title="Events" items={events} basePath="/events" delay={0.25} />
      <HorizontalScroll title="Bazaar" items={bazaar} basePath="/bazaar" delay={0.35} />
    </div>
  );
}