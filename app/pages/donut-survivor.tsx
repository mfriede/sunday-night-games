'use client';

import Link from 'next/link';
import DonutSurvivor from '../components/DonutSurvivor';

export default function DonutSurvivorPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 py-4 px-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="text-2xl font-bold hover:text-blue-500">
            Sunday Night Games
          </Link>
        </div>
      </nav>
      
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold text-center py-8">Donut Survivor</h1>
        <p className="text-center mb-8 text-gray-300">
          Use arrow keys to move and jump. Collect yellow squares to score points!
        </p>
        <DonutSurvivor />
      </div>
    </div>
  );
} 