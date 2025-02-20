'use client';

import Navbar from '../components/Navbar';
import DonutSurvivor from '../components/DonutSurvivor';

export default function DonutSurvivorPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold text-center py-8">Donuts!</h1>
        <p className="text-center mb-8 text-gray-300">
          Use arrow keys or WASD to move and jump. Collect sugar cubes to score points!
        </p>
        <DonutSurvivor />
      </div>
    </div>
  );
} 