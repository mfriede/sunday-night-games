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
          Use arrow keys or WASD to move and jump. Collect coins to score points!
        </p>
        <DonutSurvivor />

        <div className="text-center py-6">
          <p className="text-sm text-gray-400">
            Music provided by <a href="https://FesliyanStudios.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">FesliyanStudios.com</a>
          </p>
        </div>
      </div>
    </div>
  );
} 