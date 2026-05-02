'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import Header from '@/components/Header';
import { Clock, ArrowRight, Search, Zap, Star, ShieldCheck } from 'lucide-react';
import type { Session } from '@/lib/types';
import Skeleton from '@/components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';

const fallbackSessionImage = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop';

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchSessions = (pageNum = 1, search = '') => {
    setLoading(true);
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    queryParams.append('page', pageNum.toString());

    fetchAPI<{ results: Session[]; count: number; next: string | null; previous: string | null }>(
      `/bookings/sessions/?${queryParams.toString()}`
    )
      .then((data) => {
        setSessions(data.results);
        setTotalPages(Math.ceil(data.count / 6));
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching sessions:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSessions(page, searchQuery);
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSessions(1, searchQuery);
  };

  const formatPrice = (price: any) => {
    try {
      const num = parseFloat(price);
      return isNaN(num) ? '0.00' : num.toLocaleString('en-IN');
    } catch (e) {
      return '0.00';
    }
  };

  const getCategoryColor = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('frontend')) return 'bg-blue-100 text-blue-700';
    if (cat.includes('backend')) return 'bg-green-100 text-green-700';
    if (cat.includes('career')) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />
      
      {/* Hero Section */}
      {mounted && (
        <section className="bg-indigo-950 text-white pt-24 pb-32 px-8 relative overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[40rem] h-[40rem] bg-indigo-600 rounded-full blur-[120px] opacity-30 -z-0 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-[30rem] h-[30rem] bg-purple-600 rounded-full blur-[100px] opacity-20 -z-0"></div>
          </motion.div>

          <div className="max-w-7xl mx-auto relative z-10 text-center md:text-left">
            <div className="max-w-4xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-8 border border-white/10"
              >
                <Zap size={14} className="animate-pulse" />
                Empowering 10,000+ Creators Globally
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85] text-white"
              >
                MASTER YOUR <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">CRAFT.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-indigo-100/70 max-w-2xl font-medium leading-relaxed mb-12"
              >
                Book high-impact sessions with industry leading creators. 
                Transform your career with 1-on-1 expert guidance.
              </motion.p>

              <motion.form 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onSubmit={handleSearch} 
                className="flex flex-col md:flex-row gap-4 items-center max-w-3xl w-full"
              >
                <div className="relative w-full group flex-1">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-400" size={24} />
                  <input 
                    type="text" 
                    placeholder="Search by skill, creator, or topic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/10 backdrop-blur-2xl border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-white placeholder-indigo-300/50 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/15 transition-all text-lg font-medium"
                  />
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit" 
                  className="h-20 px-12 bg-white text-indigo-950 rounded-[2rem] flex items-center justify-center transition-all shadow-xl font-black uppercase tracking-widest text-sm w-full md:w-auto"
                >
                  Search
                </motion.button>
              </motion.form>
            </div>
          </div>
        </section>
      )}

      <main className="flex-1 p-8 md:p-12 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-center mb-12 bg-white p-6 rounded-3xl shadow-xl border border-gray-50 gap-4"
          >
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-4 text-center md:text-left">
              Available Sessions
              <div className="hidden md:block h-1 w-12 bg-indigo-600 rounded-full"></div>
            </h2>
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <span className="flex items-center gap-1.5"><Star size={14} className="text-yellow-400" /> 4.9 Avg Rating</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-green-500" /> Verified Pros</span>
            </div>
          </motion.div>

          <div className="catalog-container">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="skeleton-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                >
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="aspect-[4/3] rounded-[2.5rem]" />
                      <Skeleton className="h-6 w-2/3" variant="text" />
                      <Skeleton className="h-4 w-full" variant="text" />
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="session-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                >
                  {sessions.map((session, idx) => (
                    <motion.div 
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 overflow-hidden flex flex-col"
                    >
                      <div className="relative overflow-hidden">
                        <div
                          aria-label={session.title}
                          className="aspect-[4/3] bg-cover bg-center bg-indigo-50 transition-transform duration-700 group-hover:scale-110"
                          role="img"
                          style={{ backgroundImage: `url(${session.image || fallbackSessionImage})` }}
                        />
                        <div className="absolute top-6 left-6">
                          <span className={`text-[10px] px-4 py-2 rounded-2xl font-black uppercase tracking-widest backdrop-blur-xl border border-white/20 shadow-xl ${getCategoryColor(session.category)}`}>
                            {session.category || 'General'}
                          </span>
                        </div>
                      </div>

                      <div className="p-10 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <Clock size={14} className="text-indigo-400" /> {session.duration}m duration
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors line-clamp-1 tracking-tighter leading-tight">{session.title}</h3>
                        <p className="text-gray-500 text-sm mb-8 line-clamp-2 font-medium leading-relaxed">{session.description}</p>
                        
                        <div className="mt-auto pt-8 border-t border-gray-50 flex justify-between items-center">
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Investment</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">₹{formatPrice(session.price)}</p>
                          </div>
                          <Link 
                            href={`/sessions/${session.id}`} 
                            className="h-16 w-16 bg-gray-900 text-white rounded-3xl flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-500 shadow-xl transform group-hover:rotate-12"
                          >
                            <ArrowRight size={24} strokeWidth={3} />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {sessions.length === 0 && (
                    <div className="col-span-full py-32 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                      <p className="text-gray-400 font-bold text-xl italic mb-4">No results found for your search.</p>
                      <button onClick={() => { setSearchQuery(''); fetchSessions(1, ''); }} className="text-indigo-600 font-black uppercase tracking-widest text-xs hover:underline">Clear all filters</button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-16 flex justify-center items-center gap-4"
            >
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-14 px-8 border border-gray-100 rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-30 transition hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm font-black text-gray-400 uppercase tracking-widest">
                Page {page} of {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-14 px-8 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-30 transition hover:bg-indigo-600 shadow-lg"
              >
                Next
              </button>
            </motion.div>
          )}
        </div>
      </main>

      <footer className="bg-indigo-950 text-white py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-2">
              <div className="text-3xl font-black tracking-tighter text-white mb-6 italic">SESSIONS.</div>
              <p className="text-indigo-100/60 font-medium max-w-sm text-lg leading-relaxed">
                The world's leading platform for high-impact technical reviews and expert career guidance.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-8 opacity-50">Platform</h4>
              <ul className="space-y-4 text-sm font-bold text-indigo-100/40">
                <li><Link href="/" className="hover:text-white transition">Browse Catalog</Link></li>
                <li><Link href="/dashboard/creator" className="hover:text-white transition">Become a Creator</Link></li>
                <li><Link href="#" className="hover:text-white transition">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-8 opacity-50">Connect</h4>
              <ul className="space-y-4 text-sm font-bold text-indigo-100/40">
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-indigo-100/30 font-bold tracking-widest uppercase">© 2026 SESSIONS MARKETPLACE</p>
            <div className="flex gap-8 text-[10px] font-black text-indigo-100/30 uppercase tracking-widest">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
