'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { fetchAPI, readCurrentUser } from '@/lib/api';
import type { Booking, Session } from '@/lib/types';
import { ChevronLeft, ChevronRight, Clock, Edit, Eye, Layout, Plus, Trash2, TrendingUp, Upload, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '@/components/Skeleton';
import toast from 'react-hot-toast';

interface SessionFormData {
  title: string;
  description: string;
  price: string;
  duration: string;
  category: string;
}

const emptyForm: SessionFormData = {
  title: '',
  description: '',
  price: '',
  duration: '60',
  category: 'General',
};

import { useSessions, useBookings, useStats, useSessionMutation, useDeleteSession } from '@/hooks/useApi';

export default function CreatorDashboard() {
  const currentUser = readCurrentUser();
  const [sessionsPage, setSessionsPage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);

  const { data: sessionsData, isLoading: sessionsLoading, isFetching: sessionsFetching } = useSessions(sessionsPage);
  const { data: bookingsData, isLoading: bookingsLoading, isFetching: bookingsFetching } = useBookings(bookingsPage);
  const { data: statsData, isLoading: statsLoading } = useStats();

  const sessionMutation = useSessionMutation();
  const deleteMutation = useDeleteSession();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<SessionFormData>(emptyForm);

  const loading = sessionsLoading || bookingsLoading || statsLoading;
  
  const sessions = (sessionsData?.results || []).filter(
    (session) => session.creator.id === currentUser?.id
  );
  const sessionsTotalPages = Math.ceil((sessionsData?.count || 0) / 6);
  
  const bookings = bookingsData?.results || [];
  const bookingsTotalPages = Math.ceil((bookingsData?.count || 0) / 6);
  const stats = statsData || { total_successful: 0, total_pending: 0 };

  const isDirty = !editingSession || 
    editingSession.title !== formData.title ||
    editingSession.description !== formData.description ||
    editingSession.price.toString() !== formData.price ||
    editingSession.duration.toString() !== formData.duration ||
    editingSession.category !== formData.category ||
    selectedFile !== null;

  const handleOpenCreate = () => {
    setEditingSession(null);
    setFormData(emptyForm);
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const handleOpenEdit = (session: Session) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      description: session.description,
      price: session.price.toString(),
      duration: session.duration.toString(),
      category: session.category,
    });
    setSelectedFile(null);
    setPreviewUrl(session.image || null);
    setShowModal(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('duration', formData.duration);
    data.append('category', formData.category);

    if (selectedFile) {
      data.append('image', selectedFile);
    }

    sessionMutation.mutate(
      { id: editingSession?.id, data },
      {
        onSuccess: () => {
          toast.success(editingSession ? 'Session updated successfully!' : 'Session published successfully!');
          setShowModal(false);
        },
        onError: (error) => {
          console.error('Error saving session:', error);
          toast.error('Failed to save session. Please check your inputs.');
        },
      }
    );
  };

  const handleOpenDelete = (id: string) => {
    setDeletingSessionId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteSession = async () => {
    if (!deletingSessionId) return;

    deleteMutation.mutate(deletingSessionId, {
      onSuccess: () => {
        toast.success('Session removed permanently.');
        setShowDeleteModal(false);
        setDeletingSessionId(null);
      },
      onError: (error) => {
        console.error('Error deleting session:', error);
        toast.error('Failed to delete session. It may have active bookings.');
      },
    });
  };

  const confirmedRevenue = bookings.reduce((total, booking) => {
    return total + (booking.status === 'CONFIRMED' ? parseFloat(booking.session.price) : 0);
  }, 0);

  const statsCards = [
    { label: 'Total Sessions', value: sessions.length, icon: <Layout size={24} />, color: 'indigo' },
    { label: 'Confirmed Bookings', value: stats.total_successful, icon: <Users size={24} />, color: 'emerald' },
    { label: 'Pending Bookings', value: stats.total_pending, icon: <Clock size={24} />, color: 'amber' },
    { label: 'Est. Revenue', value: `₹${confirmedRevenue.toLocaleString()}`, icon: <TrendingUp size={24} />, color: 'orange' }
  ];

  const getCategoryColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('frontend')) return 'bg-blue-100 text-blue-700';
    if (cat.includes('backend')) return 'bg-green-100 text-green-700';
    if (cat.includes('career')) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Header />
      <main className="flex-1 p-8 md:p-12">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6"
          >
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Creator Hub</h1>
              <p className="text-gray-500 font-medium italic">Empower your audience with world-class sessions.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenCreate}
              className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition shadow-2xl shadow-indigo-100"
            >
              <Plus size={20} strokeWidth={3} /> Create New Session
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {statsCards.map((stat, idx) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-50 group hover:border-indigo-100 transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl group-hover:scale-110 transition-transform duration-500`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                    {loading ? <Skeleton className="h-8 w-24" /> : <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Your Sessions</h2>
                <div className="h-1 w-12 bg-indigo-600 rounded-full"></div>
              </div>
              {loading && (
                <div className="space-y-4">
                  {[1, 2].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-gray-100"></div>)}
                </div>
              )}
              <div className="space-y-6">
                {sessions.map((session) => (
                  <div key={session.id} className="group bg-white p-6 rounded-3xl shadow-lg shadow-gray-200/40 border border-gray-50 flex justify-between items-center hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div
                          aria-label={session.title}
                          className="h-16 w-16 rounded-2xl bg-indigo-50 bg-cover bg-center shadow-md group-hover:scale-105 transition-transform duration-300"
                          role="img"
                          style={{ backgroundImage: `url(${session.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100&auto=format&fit=crop'})` }}
                        />
                        <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-lg shadow-sm">
                          <div className={`h-3 w-3 rounded-full ${getCategoryColor(session.category).split(' ')[0]}`}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{session.title}</h3>
                          <span className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${getCategoryColor(session.category)}`}>
                            {session.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-5 text-xs font-bold text-gray-400">
                          <span className="flex items-center gap-1.5"><Clock size={14} className="text-indigo-400" /> {session.duration}m</span>
                          <span className="h-1 w-1 bg-gray-200 rounded-full"></span>
                          <span className="text-indigo-600 font-black tracking-tight text-sm">₹{parseFloat(session.price).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenEdit(session)} className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit size={18} /></button>
                      <button onClick={() => { setDeletingSessionId(session.id); setShowDeleteModal(true); }} className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
                {!loading && sessions.length === 0 && (
                  <div className="py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 font-bold italic">No sessions created yet.</p>
                  </div>
                )}
              </div>

              {/* Sessions Pagination */}
              {!loading && sessionsTotalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-3">
                  <button onClick={() => setSessionsPage(p => Math.max(1, p - 1))} disabled={sessionsPage === 1 || sessionsFetching} className="p-3 border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition"><ChevronLeft size={16} /></button>
                  <span className="text-[10px] font-black uppercase tracking-widest">{sessionsPage} / {sessionsTotalPages}</span>
                  <button onClick={() => setSessionsPage(p => Math.min(sessionsTotalPages, p + 1))} disabled={sessionsPage === sessionsTotalPages || sessionsFetching} className="p-3 border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition"><ChevronRight size={16} /></button>
                </div>
              )}
            </section>

            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Recent Bookings</h2>
                <div className="h-1 w-12 bg-indigo-600 rounded-full"></div>
              </div>
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] min-w-[140px]">Learner</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Session Detail</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] min-w-[120px]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {bookings.length > 0 ? bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-indigo-50/30 transition-colors group">
                          <td className="px-6 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-100">
                                {booking.user.username.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-gray-900 leading-none mb-1 truncate">{booking.user.username.split('@')[0]}</span>
                                <span className="text-[10px] font-medium text-gray-400 truncate">{booking.user.username}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-700 line-clamp-1">{booking.session.title}</span>
                              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider mt-1 flex items-center gap-1">
                                <Clock size={10} /> {new Date(booking.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              booking.status === 'CONFIRMED' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full mr-2 ${
                                booking.status === 'CONFIRMED' ? 'bg-emerald-500' : 'bg-amber-500'
                              } animate-pulse`}></span>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={3} className="px-8 py-12 text-center text-gray-400 font-bold italic">No bookings found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bookings Pagination */}
              {!loading && bookingsTotalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-3">
                  <button onClick={() => setBookingsPage(p => Math.max(1, p - 1))} disabled={bookingsPage === 1 || bookingsFetching} className="p-3 border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition"><ChevronLeft size={16} /></button>
                  <span className="text-[10px] font-black uppercase tracking-widest">{bookingsPage} / {bookingsTotalPages}</span>
                  <button onClick={() => setBookingsPage(p => Math.min(bookingsTotalPages, p + 1))} disabled={bookingsPage === bookingsTotalPages || bookingsFetching} className="p-3 border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition"><ChevronRight size={16} /></button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-md z-[60] overflow-y-auto">
            <div className="min-h-full flex items-center justify-center p-4 sm:p-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 40 }}
                className="bg-white rounded-[3rem] max-w-2xl w-full p-8 sm:p-12 shadow-[0_32px_64px_-12px_rgba(79,70,229,0.2)] relative"
              >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{editingSession ? 'Edit' : 'Create'} Session</h2>
                    {isDirty && editingSession && (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-amber-100 animate-pulse">
                        <div className="h-1 w-1 bg-amber-500 rounded-full"></div>
                        Unsaved
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 font-medium italic">Craft a world-class experience.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="h-10 w-10 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300">
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">Session Aesthetics</label>
                  <div className="relative group">
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-100 rounded-[2rem] cursor-pointer hover:bg-indigo-50/30 hover:border-indigo-200 transition-all duration-500 relative overflow-hidden">
                      {previewUrl ? (
                        <div className="absolute inset-0 group">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <p className="text-white font-black uppercase tracking-widest text-xs">Change Artwork</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6">
                          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3 transform group-hover:rotate-12 transition-transform duration-500">
                            <Upload size={24} strokeWidth={2.5} />
                          </div>
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Upload banner</p>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="col-span-full">
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Session Title</label>
                    <input 
                      type="text" required 
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-100 focus:ring-8 focus:ring-indigo-500/5 text-gray-900 font-bold placeholder:text-gray-300 transition-all" 
                      placeholder="e.g. Masterclass in Scalable Architecture" 
                      value={formData.title} 
                      onChange={(event) => setFormData({ ...formData, title: event.target.value })} 
                    />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Expertise Area</label>
                    <div className="relative">
                      <select 
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-100 focus:ring-8 focus:ring-indigo-500/5 text-gray-900 font-bold appearance-none cursor-pointer transition-all" 
                        value={formData.category} 
                        onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                      >
                        <option value="General">General</option>
                        <option value="Frontend Engineering">Frontend Engineering</option>
                        <option value="Backend Engineering">Backend Engineering</option>
                        <option value="Career Growth">Career Growth</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ChevronRight size={18} className="rotate-90" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Duration (Min)</label>
                    <div className="relative">
                      <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input 
                        type="number" required 
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-100 focus:ring-8 focus:ring-indigo-500/5 text-gray-900 font-bold transition-all" 
                        value={formData.duration} 
                        onChange={(event) => setFormData({ ...formData, duration: event.target.value })} 
                      />
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="col-span-full">
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Value Proposition</label>
                    <textarea 
                      required rows={3} 
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-100 focus:ring-8 focus:ring-indigo-500/5 text-gray-900 font-bold placeholder:text-gray-300 transition-all leading-relaxed" 
                      placeholder="What deep insights will your learners gain?" 
                      value={formData.description} 
                      onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                    ></textarea>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="col-span-full">
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Session Fee (INR)</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black text-lg italic">₹</span>
                      <input 
                        type="number" required 
                        className="w-full pl-14 pr-6 py-5 bg-indigo-50/30 border-2 border-transparent rounded-3xl outline-none focus:bg-white focus:border-indigo-200 focus:ring-12 focus:ring-indigo-500/5 text-gray-900 font-black text-2xl tracking-tighter transition-all" 
                        value={formData.price} 
                        onChange={(event) => setFormData({ ...formData, price: event.target.value })} 
                      />
                    </div>
                  </motion.div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.7 }}
                  className="pt-6"
                >
                  <button 
                    type="submit" 
                    disabled={!isDirty || sessionMutation.isPending}
                    className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-lg uppercase tracking-[0.2em] hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 shadow-2xl shadow-indigo-200 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed group relative overflow-hidden"
                  >
                    <span className="relative z-10">{sessionMutation.isPending ? 'PROCESSING...' : (editingSession ? 'Update Experience' : 'Launch Session')}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700"></div>
                  </button>
                  {isDirty && (
                    <p className="text-center text-[10px] font-black text-amber-500 uppercase tracking-widest mt-4 animate-bounce">
                      Review changes before publishing
                    </p>
                  )}
                </motion.div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[3rem] max-w-sm w-full p-10 shadow-2xl text-center"
            >
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-red-50 text-red-600 mb-8 transform -rotate-12">
                <Trash2 size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Destroy Session?</h3>
              <p className="text-gray-500 font-medium mb-10 leading-relaxed italic">
                This action is irreversible. All associated bookings will be archived.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-4 bg-gray-50 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSession}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition shadow-2xl shadow-red-100 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
