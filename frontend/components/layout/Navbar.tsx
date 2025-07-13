"use client";

import "@/app/globals.css";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";
import Image from "next/image";

const Navbar = ()=>{
  const { data: session } = useSession();
  const isLoggedIn=!!session;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Soul Walks", path: "/trips" },
    { name: "DivyaVidya", path: "/courses" },
    { name: "Divine Bazaar", path: "/bazaar" },
  ];

  const renderMenuItems = (mobile: boolean = false) => (
    <>
      {menuItems.map((item) => (
        <Link href={item.path} key={item.path}>
          <motion.span
            className={`relative px-4 py-2 text-${mobile ? 'lg' : 'sm'} cursor-pointer
              ${pathname === item.path ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {item.name}
            {pathname === item.path && (
              <motion.div
                layoutId="underline"
                className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600"
                initial={false}
              />
            )}
          </motion.span>
        </Link>
      ))}
    </>
  );

  const handleSignIn = async () => {
    try {
      console.log('Attempting to sign in with Google...');
      const result = await signIn('google', { 
        callbackUrl: window.location.href,
        redirect: true 
      });
      console.log('Sign in result:', result);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
        <motion.header
          className={`fixed w-full z-50 transition-all duration-300 ${
            isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
          }`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20">
              {/* Logo */}
              <motion.div
                className="flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/">
                  <span className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent 
                    bg-gradient-to-r from-green-600 to-emerald-600">
                    Sovesa
                  </span>
                </Link>
              </motion.div>

              {/* Desktop Menu */}
              <div className="hidden sm:flex items-center space-x-4">
                {renderMenuItems()}

                {!isLoggedIn && 
                  (<motion.button
                    onClick={handleSignIn}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="ml-4 px-6 py-2 bg-green-600 text-white rounded-full font-medium
                      hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Login with Google
                  </motion.button>
                  )
                }
                {isLoggedIn && (
                  <div className="relative ml-4" ref={dropdownRef}>
                    <button
                      onClick={() => setShowProfileMenu((v) => !v)}
                      onBlur={() => setTimeout(() => setShowProfileMenu(false), 150)}
                      className="focus:outline-none"
                    >
                      {session?.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt="Profile"
                          width={40}
                          height={40}
                          className="rounded-full border-2 border-green-600 shadow-sm"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {session.user?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                    </button>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border"
                        onMouseLeave={() => setShowProfileMenu(false)}
                      >
                        <Link href="/dashboard">
                          <span className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">Profile</span>
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </nav>

        </motion.header>
  );
};

export default Navbar;