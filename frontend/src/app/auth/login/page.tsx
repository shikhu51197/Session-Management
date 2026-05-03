'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { fetchAPI, readCurrentUser, writeAuthSession } from '@/lib/api';
import { useEffect, useState } from 'react';
import { ShieldCheck, UserCheck, Star, Layout, Zap, ArrowRight } from 'lucide-react';
import type { AuthResponse, UserRole } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<UserRole>('USER');

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'login_required') {
      toast.error('Identity required. Please sign in to access this page.', {
        id: 'login-required-toast',
        duration: 4000,
      });
    }
  }, [searchParams]);

  useEffect(() => {
    const user = readCurrentUser();
    if (user) {
      router.push(user.role === 'CREATOR' ? '/dashboard/creator' : '/dashboard/user');
    }
  }, [router]);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('Google did not return a credential.');
      }

      const response = await fetchAPI<AuthResponse>('/core/auth/google/', {
        method: 'POST',
        body: JSON.stringify({
          token: credentialResponse.credential,
          role: role,
        }),
      });
      writeAuthSession(response);

      router.push(response.user.role === 'CREATOR' ? '/dashboard/creator' : '/dashboard/user');
    } catch (error) {
      console.error('Login Failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleDevLogin = async () => {
    try {
      const response = await fetchAPI<AuthResponse>('/core/auth/google/', {
        method: 'POST',
        body: JSON.stringify({
          token: 'dev-token',
          role: role,
          is_dev: true
        }),
      });
      writeAuthSession(response);
      router.push(response.user.role === 'CREATOR' ? '/dashboard/creator' : '/dashboard/user');
    } catch (e) {
      alert('Dev login failed. Ensure backend supports is_dev flag.');
    }
  };

  const clientIdMissing = !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID === '' ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.includes('dummy');

  return (
    <div className="min-h-screen flex items-stretch bg-white font-sans overflow-hidden">
      {/* Left side - Visual/Info */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 bg-indigo-600 p-16 flex-col justify-between text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[30rem] h-[30rem] bg-indigo-500 rounded-full opacity-50 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-[30rem] h-[30rem] bg-indigo-700 rounded-full opacity-50 blur-[100px]"></div>

        <div className="z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-black tracking-tighter mb-6 text-white italic"
          >
            SESSIONS.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-indigo-100 text-xl max-w-md font-medium leading-relaxed"
          >
            Join the elite marketplace for high-impact technical reviews and expert career guidance.
          </motion.p>
        </div>

        <div className="z-10 space-y-10">
          {[
            { icon: <ShieldCheck size={28} />, title: "Secure Payments", desc: "Integrated with Razorpay for global transactions." },
            { icon: <UserCheck size={28} />, title: "Verified Experts", desc: "Every creator is vetted for technical excellence." },
            { icon: <Zap size={28} />, title: "Instant Access", desc: "Book and start your session in minutes." }
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              className="flex gap-6 group"
            >
              <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl text-white group-hover:scale-110 transition-transform duration-500 shadow-xl border border-white/10">
                {item.icon}
              </div>
              <div>
                <p className="font-black text-white text-lg tracking-tight mb-1">{item.title}</p>
                <p className="text-sm text-indigo-100/70 font-medium">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="z-10 flex items-center gap-3 text-indigo-200 text-xs font-black uppercase tracking-[0.2em]"
        >
          <Star size={16} fill="currentColor" className="text-yellow-400" />
          <span>JOIN 10,000+ USERS TODAY</span>
        </motion.div>
      </motion.div>

      {/* Right side - Login Form */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-24 bg-gray-50/30"
      >
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12 text-center lg:text-left"
          >
            <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter leading-tight">Welcome <br />back</h2>
            <p className="text-gray-400 font-medium text-lg italic">Sign in to your account to continue the journey.</p>
          </motion.div>

          <div className="mb-10">
            <label className="block text-[10px] font-black text-gray-400 mb-5 uppercase tracking-[0.3em]">Identity Selection</label>
            <div className="flex gap-4">
              {['USER', 'CREATOR'].map((r) => (
                <motion.button
                  key={r}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setRole(r as UserRole)}
                  className={`flex-1 py-5 px-6 rounded-3xl border-2 transition-all duration-500 font-black uppercase tracking-widest text-[10px] flex flex-col items-center gap-3 ${role === r ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-xl shadow-indigo-100' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 shadow-sm'
                    }`}
                >
                  {r === 'USER' ? <UserCheck size={28} strokeWidth={2.5} /> : <Layout size={28} strokeWidth={2.5} />}
                  <span>{r}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em]"><span className="bg-gray-50/30 px-6 text-gray-400">Secure Authentication</span></div>
            </div>

            <div className="flex flex-col gap-4">
              {clientIdMissing ? (
                <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-800 text-xs font-bold flex items-center gap-4 animate-shake">
                  <ShieldCheck size={24} className="shrink-0" />
                  <p>OAuth Configuration Missing. Check .env settings.</p>
                </div>
              ) : (
                <div className="w-full group">
                  <div className="w-full transform group-hover:scale-[1.02] transition-transform duration-500 shadow-2xl shadow-gray-200/50 rounded-full overflow-hidden">
                    <GoogleLogin
                      onSuccess={handleSuccess}
                      onError={() => console.log('Login Failed')}
                      shape="pill"
                      theme="filled_blue"
                      size="large"
                      text="signin_with"
                      width="500"
                    />
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDevLogin}
                className="w-full py-5 bg-gray-900 text-white rounded-full font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all duration-500 shadow-2xl shadow-gray-200 group mt-4"
              >
                Developer Bypass <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center text-[10px] text-gray-300 font-black uppercase tracking-widest leading-loose"
          >
            By signing in, you agree to our <br className="md:hidden" />
            <a href="#" className="text-indigo-400 hover:underline">Terms of Service</a> & <a href="#" className="text-indigo-400 hover:underline">Privacy Policy</a>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
