'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearAuthSession, readCurrentUser } from '@/lib/api';
import type { AppUser } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AppUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const userData = readCurrentUser();
      setUser(userData);
    }
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    router.push('/auth/login');
  };

  const navLinks = [
    { name: 'Browse', href: '/' },
    ...(user ? [
      { name: 'Dashboard', href: user.role === 'CREATOR' ? '/dashboard/creator' : '/dashboard/user' },
      { name: 'Profile', href: '/profile' }
    ] : [])
  ];

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-[100] shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-12">
            <Link href="/" className="group flex items-center gap-2">
              <motion.div 
                whileHover={{ rotate: 12 }}
                className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 transition-transform duration-300"
              >
                <span className="text-white font-black text-xl italic">S.</span>
              </motion.div>
              <span className="text-2xl font-black text-gray-900 tracking-tighter">SESSIONS.</span>
            </Link>
            
            <nav className="hidden md:flex gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  href={link.href} 
                  className={`text-sm font-black uppercase tracking-[0.15em] transition-all relative py-2 ${
                    pathname === link.href ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {link.name}
                  {pathname === link.href && (
                    <motion.div 
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                    />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <AnimatePresence mode="wait">
              {mounted && (user ? (
                <motion.div 
                  key="user-box"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">
                      {user.role}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {user.first_name || user.username.split('@')[0]}
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-100 overflow-hidden group cursor-pointer hover:border-indigo-600 transition-colors">
                    <div className="h-full w-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {user.username.substring(0, 1).toUpperCase()}
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="ml-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-gray-500 bg-gray-50 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
                  >
                    Logout
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="login-box"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-4"
                >
                  <Link 
                    href="/auth/login" 
                    className="px-8 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 active:scale-95"
                  >
                    Sign In
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
