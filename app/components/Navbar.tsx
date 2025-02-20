'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <>
      {/* Development Banner */}
      <div className="bg-blue-600 text-white py-3 px-6 text-center">
        <p className="text-sm md:text-base">
          🚧 We&apos;re still building! Please enjoy our games in the meantime. 🎮
        </p>
      </div>

      <nav className="bg-gray-800 py-4 px-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="text-2xl font-bold hover:text-blue-500">
            Sunday Night Games
          </Link>
          <div className="space-x-6">
            <Link href="/" className="hover:text-blue-500 transition-colors">Home</Link>
            <Link href="/donut-survivor" className="hover:text-blue-500 transition-colors">Donut Survivor</Link>
            <Link href="/flappy-donut" className="hover:text-blue-500 transition-colors">Flappy Donut</Link>
            <Link href="/contact" className="hover:text-blue-500 transition-colors">Contact</Link>
          </div>
        </div>
      </nav>
    </>
  );
} 