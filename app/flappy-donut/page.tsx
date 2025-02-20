'use client';

import Link from 'next/link';
import FlappyDonut from '../components/FlappyDonut';

export default function FlappyDonutPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Development Banner */}
      <div className="bg-blue-600 text-white py-3 px-6 text-center">
        <p className="text-sm md:text-base">
          🚧 Flappy Donut is in development! Try out our beta version. 🎮
        </p>
      </div>

      <nav className="bg-gray-800 py-4 px-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="text-2xl font-bold hover:text-blue-500">
            Sunday Night Games
          </Link>
        </div>
      </nav>
      
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold text-center py-8">Flappy Donut</h1>
        <p className="text-center mb-8 text-gray-300">
          Guide your donut through the obstacles by tapping space or clicking to flap!
        </p>
        <FlappyDonut />
      </div>
    </div>
  );
} 