'use client';

import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Link href="/" className="text-indigo-600 hover:text-indigo-900 font-medium">Logout</Link>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Sessions</h3>
            <p className="mt-2 text-3xl font-semibold text-indigo-600">3</p>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Bookings</h3>
            <p className="mt-2 text-3xl font-semibold text-indigo-600">12</p>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Revenue</h3>
            <p className="mt-2 text-3xl font-semibold text-indigo-600">$450</p>
          </div>
        </div>
      </main>
    </div>
  );
}
