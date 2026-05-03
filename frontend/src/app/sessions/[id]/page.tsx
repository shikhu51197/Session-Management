'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import Script from 'next/script';
import { useSession } from '@/hooks/useApi';
import Header from '@/components/Header';
import type { Booking, RazorpayOptions, RazorpayOrder, Session } from '@/lib/types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ShieldCheck, Zap, ArrowLeft, Star, Users } from 'lucide-react';
import Link from 'next/link';

export default function SessionDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const { data: session, isLoading: isSessionLoading } = useSession(id);
  const [isBooking, setIsBooking] = useState(false);

  const handleBook = async () => {
    if (!session) return;

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.error('Please login to book a session');
      router.push('/auth/login');
      return;
    }

    setIsBooking(true);
    try {
      // 1. Create booking
      const booking = await fetchAPI<Booking>('/bookings/bookings/', {
        method: 'POST',
        body: JSON.stringify({
          session_id: session.id,
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 3600000).toISOString(),
        }),
      });

      // 2. Create order
      const order = await fetchAPI<RazorpayOrder>('/payments/create-order/', {
        method: 'POST',
        body: JSON.stringify({ booking_id: booking.id }),
      });

      // 3. Open Razorpay
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Sessions Marketplace',
        description: `Booking for ${session.title}`,
        order_id: order.id,
        handler: async function (response) {
          await fetchAPI<{ status: string }>('/payments/verify/', {
            method: 'POST',
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          toast.success('Payment Successful! Session Booked.');
          router.push('/dashboard/user');
        },
        theme: { color: '#4f46e5' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to book session. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (isSessionLoading || !session) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="h-16 w-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Syncing with Expert...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />
      <main className="flex-1 p-8 md:p-12 lg:p-24 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-60"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12"
          >
            <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-indigo-600 transition-colors mb-6 group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Catalog
            </Link>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-20 items-start">
            
            {/* Image Side */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-3/5 group"
            >
              <div className="relative rounded-[4rem] overflow-hidden shadow-2xl shadow-indigo-100 transform transition-transform duration-700 group-hover:scale-[1.01]">
                {session.image ? (
                  <div
                    aria-label={session.title}
                    className="aspect-[4/3] w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    role="img"
                    style={{ backgroundImage: `url(${session.image})` }}
                  />
                ) : (
                  <div className="aspect-[4/3] w-full bg-indigo-900 flex items-center justify-center">
                    <span className="text-indigo-400 font-black text-2xl tracking-tighter italic">SESSIONS.</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute bottom-10 left-10 flex gap-4">
                  <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl font-black text-indigo-600 text-[10px] tracking-widest uppercase shadow-xl">
                    Verified Expert
                  </div>
                  <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl font-black text-gray-900 text-[10px] tracking-widest uppercase shadow-xl flex items-center gap-2">
                    <Star size={14} className="text-yellow-500" /> 4.9 Rating
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Content Side */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-2/5 flex flex-col"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 w-fit border border-indigo-100 shadow-sm">
                <span className="h-2 w-2 bg-indigo-600 rounded-full animate-pulse"></span>
                {session.category || 'Expert Masterclass'}
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 tracking-tighter leading-[0.85] uppercase">
                {session.title}
              </h1>

              <div className="flex items-center gap-10 mb-12 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-50 shadow-inner">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Investment</span>
                  <span className="text-4xl font-black text-gray-900 tracking-tight">₹{parseFloat(session.price).toLocaleString()}</span>
                </div>
                <div className="h-12 w-px bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Duration</span>
                  <span className="text-4xl font-black text-gray-900 tracking-tight">{session.duration}<span className="text-lg text-indigo-300 font-bold ml-1">min</span></span>
                </div>
              </div>

              <div className="prose prose-indigo max-w-none mb-12">
                <p className="text-gray-500 text-xl font-medium leading-relaxed italic border-l-4 border-indigo-100 pl-8">
                  {session.description}
                </p>
              </div>

              <div className="bg-indigo-950 rounded-[3rem] p-10 mb-10 shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-indigo-600 rounded-full opacity-20 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="h-16 w-16 rounded-[1.5rem] bg-white/10 flex items-center justify-center text-white backdrop-blur-xl border border-white/10">
                    <Zap size={32} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Availability</p>
                    <p className="font-bold text-white text-lg italic">Instant Confirmation</p>
                  </div>
                </div>
                
                <button
                  onClick={handleBook}
                  disabled={isBooking}
                  className="w-full py-6 bg-white text-indigo-950 rounded-[2rem] font-black text-xl hover:bg-indigo-50 transition transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl disabled:opacity-50 relative overflow-hidden group/btn"
                >
                  <span className="relative z-10">{isBooking ? 'AUTHENTICATING...' : 'SECURE BOOKING'}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-white translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-500"></div>
                </button>
              </div>

              <div className="flex justify-between items-center px-4">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] flex items-center gap-2">
                  <ShieldCheck size={14} className="text-indigo-400" /> Razorpay Secure
                </p>
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Users size={14} className="text-indigo-400" /> 10k+ Learners
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
