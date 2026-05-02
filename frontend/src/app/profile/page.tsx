'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { fetchAPI, readCurrentUser } from '@/lib/api';
import type { AppUser } from '@/lib/types';
import { Camera, Save, User as UserIcon, Shield, Mail, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface ProfileForm {
  first_name: string;
  last_name: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [form, setForm] = useState<ProfileForm>({ first_name: '', last_name: '' });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const currentUser = readCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setForm({
          first_name: currentUser.first_name || '',
          last_name: currentUser.last_name || '',
        });
        setPreviewUrl(currentUser.avatar || null);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatar(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      data.append('first_name', form.first_name);
      data.append('last_name', form.last_name);

      if (avatar) {
        data.append('avatar', avatar);
      }

      const updatedUser = await fetchAPI<AppUser>('/core/auth/me/', {
        method: 'PATCH',
        body: data,
      });

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success('Profile aesthetics updated.');
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error('Sync failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isDirty = user && (user.first_name !== form.first_name || user.last_name !== form.last_name || avatar !== null);

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      <Header />
      <main className="flex-1 p-8 md:p-12 lg:p-24 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-60"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12"
          >
            <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-indigo-600 transition-colors mb-6 group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </Link>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">Account Identity</h1>
            <p className="text-gray-500 font-medium italic">Manage your public presence across the marketplace.</p>
          </motion.div>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit} 
            className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-50">
              {/* Left Side - Avatar */}
              <div className="p-12 lg:w-1/3 bg-gray-50/30 flex flex-col items-center justify-center text-center">
                <div className="relative group">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="h-48 w-48 rounded-[3rem] bg-indigo-100 bg-cover bg-center border-4 border-white shadow-2xl overflow-hidden relative"
                    style={{ backgroundImage: previewUrl ? `url(${previewUrl})` : undefined }}
                  >
                    {!previewUrl && (
                      <div className="absolute inset-0 flex items-center justify-center text-indigo-300">
                        <UserIcon size={64} strokeWidth={1} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                       <Camera size={32} className="text-white" />
                    </div>
                  </motion.div>
                  <label className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-2xl shadow-xl border border-gray-50 text-[10px] font-black uppercase tracking-widest text-indigo-600 cursor-pointer hover:bg-indigo-600 hover:text-white transition-all">
                    Change Artwork
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
                <div className="mt-12">
                  <p className="text-xl font-black text-gray-900 tracking-tight">{user?.first_name || 'Expert'} {user?.last_name || 'Creator'}</p>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">{user?.role}</p>
                </div>
              </div>

              {/* Right Side - Details */}
              <div className="p-12 lg:w-2/3 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      <UserIcon size={14} className="text-indigo-400" /> First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.first_name}
                      onChange={(event) => setForm({ ...form, first_name: event.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-100 focus:ring-8 focus:ring-indigo-500/5 text-gray-900 font-bold transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      <UserIcon size={14} className="text-indigo-400" /> Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.last_name}
                      onChange={(event) => setForm({ ...form, last_name: event.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-100 focus:ring-8 focus:ring-indigo-500/5 text-gray-900 font-bold transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2 opacity-60">
                  <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    <Mail size={14} /> Registered Email
                  </label>
                  <input
                    disabled
                    value={user?.email || ''}
                    className="w-full px-6 py-4 bg-gray-100 border-2 border-transparent rounded-2xl text-gray-500 font-medium cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2 opacity-60">
                  <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    <Shield size={14} /> Platform Role
                  </label>
                  <input
                    disabled
                    value={user?.role || ''}
                    className="w-full px-6 py-4 bg-gray-100 border-2 border-transparent rounded-2xl text-gray-500 font-bold uppercase tracking-widest text-[10px] cursor-not-allowed"
                  />
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pt-8 flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Last Updated</p>
                    <p className="text-xs font-bold text-gray-400">Sync with cloud active</p>
                  </div>
                  <button
                    disabled={saving || !isDirty}
                    type="submit"
                    className="px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex items-center gap-3 group"
                  >
                    <Save size={18} className="group-hover:rotate-12 transition-transform" />
                    {saving ? 'Syncing...' : 'Secure Save'}
                  </button>
                </motion.div>
                
                {isDirty && !saving && (
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest text-center mt-4 animate-bounce">
                    Unsaved alterations detected
                  </p>
                )}
              </div>
            </div>
          </motion.form>
        </div>
      </main>
    </div>
  );
}
