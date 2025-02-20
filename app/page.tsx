'use client';

import Link from 'next/link';
import Navbar from "./components/Navbar";
import MailingListSignup from "./components/MailingListSignup";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8">Welcome to Sunday Night Games</h1>
          <p className="text-lg text-gray-300 mb-12">
            At Sunday Night Games, we believe great games are born from passion, 
            creativity, and a spark of imagination shared among friends. Founded by 
            three lifelong gamers and dreamers, our mission is simple: to craft fun, 
            immersive, and memorable experiences for players everywhere.
          </p>
          <Link 
            href="/donut-survivor" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Play Donut Survivor
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="bg-gray-800 py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-12">Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Donut Survivor</h3>
              <img src="/images/donut_surivor_1.jpg" alt="Donut Survivor" className="w-full h-48 object-cover rounded-lg mb-4" />
              <p className="text-gray-300">A fast-paced, arcade-style roguelike where players control a brave donut fighting off relentless waves of enemies. Survive as long as possible by collecting dessert-themed upgrades and abilities, turning yourself into an unstoppable sugary force!</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Sandbox Game</h3>
              <img src="/images/game2_image.jpg" alt="Sandbox Game" className="w-full h-48 object-cover rounded-lg mb-4" />
              <p className="text-gray-300">This game plunges players into a planet where society has fractured after the collapse of a vital wormhole connecting it to Earth. With technology reduced to relics of the past, survivors cling to life in harsh environments dominated by decaying ancient cities and hostile factions. Players must scavenge, build, and navigate the remnants of a once-thriving colony while contending with alien creatures and rival groups.</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Coming Soon!</h3>
              <img src="/images/coming_soon.jpg" alt="Coming Soon" className="w-full h-48 object-cover rounded-lg mb-4" />
              <p className="text-gray-300">Details on our next game will coming soon!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mailing List Signup */}
      <MailingListSignup />

      {/* Footer */}
      <footer className="bg-gray-800 py-8 px-6 mt-16">
        <div className="container mx-auto text-center text-gray-300">
          <p>&copy; 2025 Sunday Night Games. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
