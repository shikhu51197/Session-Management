'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useBookings, useStats } from '@/hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle, Clock, ArrowRight, BookOpen, Star } from 'lucide-react';
import Skeleton from '@/components/Skeleton';

export default function UserDashboard() {
  const [page, setPage] = useState(1);
  const { data: bookingsData, isLoading: bookingsLoading, isFetching: bookingsFetching } = useBookings(page);
  const { data: statsData, isLoading: statsLoading } = useStats();

  const loading = bookingsLoading || statsLoading;
  const bookings = bookingsData?.results || [];
  const stats = statsData || { total_successful: 0, total_pending: 0 };
  const totalPages = Math.ceil((bookingsData?.count || 0) / 6);

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      <Header />
      <main className="flex-1 p-8 md:p-12 lg:p-16">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8"
          >
            <div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-3">Learner Journey</h1>
              <p className="text-gray-500 font-medium text-lg italic">Mastering skills, one session at a time.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/profile" className="px-8 py-4 border border-gray-200 text-gray-600 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-white hover:shadow-xl transition-all">
                Account Settings
              </Link>
              <Link href="/" className="px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition shadow-2xl shadow-indigo-100 flex items-center gap-2">
                Explore Catalog <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { label: 'Confirmed Sessions', value: stats.total_successful, icon: <CheckCircle size={28} />, color: 'emerald', delay: 0.1 },
              { label: 'Pending Requests', value: stats.total_pending, icon: <Clock size={28} />, color: 'amber', delay: 0.2 },
              { label: 'Learning Points', value: stats.total_successful * 100, icon: <Star size={28} />, color: 'indigo', delay: 0.3 }
            ].map((stat) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: stat.delay }}
                className={`bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-200/40 border border-${stat.color}-50 group hover:border-${stat.color}-100 transition-all`}
              >
                <div className="flex items-center gap-6">
                  <div className={`p-5 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl group-hover:rotate-12 transition-transform duration-500`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                    <p className={`text-4xl font-black text-${stat.color}-900 tracking-tight`}>{loading ? '...' : stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-4">
              Booking History
              <div className="h-1 w-12 bg-indigo-600 rounded-full"></div>
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-[2rem]" />)}
              </motion.div>
            ) : bookings.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-indigo-50/50 rounded-[3rem] p-24 text-center border-2 border-dashed border-indigo-100"
              >
                <div className="h-20 w-20 bg-white rounded-3xl mx-auto mb-8 flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-100">
                  <BookOpen size={40} />
                </div>
                <p className="text-indigo-950 text-2xl font-black tracking-tight mb-4 uppercase">No bookings yet</p>
                <p className="text-indigo-400 font-medium italic mb-10">Start your journey by exploring our curated expert sessions.</p>
                <Link href="/" className="inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:scale-105 transition-all">
                  Browse Catalog
                </Link>
              </motion.div>
            ) : (
              <motion.div 
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-6"
              >
                {bookings.map((booking, idx) => (
                  <motion.div 
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-2xl hover:border-indigo-100 transition-all duration-500"
                  >
                    <div className="flex items-center gap-8 mb-6 md:mb-0">
                      <div className="h-20 w-20 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner overflow-hidden group-hover:scale-110 transition-transform duration-500">
                        {booking.session.image ? (
                          <img src={booking.session.image} alt={booking.session.title} className="h-full w-full object-cover" />
                        ) : (
                          <span className="font-black text-3xl italic">S.</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight">{booking.session.title}</h3>
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 bg-gray-50 text-gray-400 rounded-md">#{booking.id.substring(0, 8)}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Calendar size={14} className="text-indigo-400" /> {new Date(booking.start_time).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          <span className="h-1 w-1 bg-gray-200 rounded-full"></span>
                          <span className="flex items-center gap-1.5 text-indigo-600">₹{parseFloat(booking.session.price).toLocaleString()} Investment</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full md:w-auto gap-12 border-t md:border-none pt-6 md:pt-0">
                      <div className="flex flex-col items-end">
                        <span className={`inline-flex items-center px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 
                          booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          <span className={`h-2 w-2 rounded-full mr-2 ${
                            booking.status === 'CONFIRMED' ? 'bg-emerald-500' : 
                            booking.status === 'PENDING' ? 'bg-amber-500' : 'bg-red-500'
                          } animate-pulse`}></span>
                          {booking.status}
                        </span>
                      </div>
                      <Link href={`/sessions/${booking.session.id}`} className="h-14 w-14 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all duration-500 shadow-sm transform group-hover:translate-x-2">
                        <ArrowRight size={24} strokeWidth={3} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {!loading && totalPages > 1 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-16 flex justify-center items-center gap-6"
            >
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || bookingsFetching}
                className="h-14 px-10 border border-gray-100 rounded-2xl font-black uppercase tracking-widest text-[10px] disabled:opacity-30 transition hover:bg-white hover:shadow-xl active:scale-95 bg-white/50 backdrop-blur-md"
              >
                Previous
              </button>
              <div className="h-12 w-32 bg-white rounded-full flex items-center justify-center shadow-inner border border-gray-50">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Page <span className="text-indigo-600">{page}</span> / {totalPages}
                </span>
              </div>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || bookingsFetching}
                className="h-14 px-10 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] disabled:opacity-30 transition hover:bg-indigo-600 shadow-2xl active:scale-95"
              >
                Next
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
