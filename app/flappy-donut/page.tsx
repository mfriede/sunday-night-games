'use client';

import Navbar from '../components/Navbar';
import FlappyDonut from '../components/FlappyDonut';

export default function FlappyDonutPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold text-center py-8">Flappy Donut</h1>
        <p className="text-center mb-8 text-gray-300">
          Guide your donut through the obstacles by tapping space or clicking to flap!
        </p>
        <FlappyDonut />
        
        {/* Music Attribution */}
        <div className="text-center text-sm text-gray-400 mt-8 pb-4">
          <p>
            Music provided by{' '}
            <a 
              href="https://www.fesliyanstudios.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              FesliyanStudios.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 