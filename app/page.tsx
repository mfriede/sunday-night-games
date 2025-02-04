import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sunday Night Games - Play Together, Stay Connected",
  description: "A unique multiplayer gaming experience for families and friends.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 py-4 px-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Sunday Night Games</h1>
          <div className="space-x-4">
            <a href="#about" className="hover:text-blue-500">About</a>
            <a href="#features" className="hover:text-blue-500">Features</a>
            <a href="#gallery" className="hover:text-blue-500">Gallery</a>
            <a href="#contact" className="hover:text-blue-500">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-bold mb-8">Sunday Night Games</h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
        At Sunday Night Games, we believe great games are born from passion, creativity, and a spark of imagination shared among friends. Founded by three lifelong gamers and dreamers, our mission is simple: to craft fun, immersive, and memorable experiences for players everywhere.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
          Find us on Steam!
        </button>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-800 py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-12">Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Donut Survivor</h3>
              <p className="text-gray-300"> A fast-paced, arcade-style roguelike where players control a brave donut fighting off relentless waves of enemies. Survive as long as possible by collecting dessert-themed upgrades and abilities, turning yourself into an unstoppable sugary force!</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Sandbox Game</h3>
              <p className="text-gray-300">This game plunges players into a planet where society has fractured after the collapse of a vital wormhole connecting it to Earth. With technology reduced to relics of the past, survivors cling to life in harsh environments dominated by decaying ancient cities and hostile factions. Players must scavenge, build, and navigate the remnants of a once-thriving colony while contending with alien creatures and rival groups.</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Coming Soon!</h3>
              <p className="text-gray-300"> Details on our next game will coming soon!</p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Play Section */}
  { /*   <section id="about" className="container mx-auto px-6 py-16"> 

        <h2 className="text-3xl font-bold text-center mb-8">How to Play</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Step 1: Create an Account</h3>
            <p className="text-gray-300">Sign up for a free account and join the Sunday Night Games community.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Step 2: Invite Friends</h3>
            <p className="text-gray-300">Send invites to your family and friends to play together.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Step 3: Start Playing</h3>
            <p className="text-gray-300">Choose your game mode and enjoy the fun with your loved ones!</p>
          </div>
        </div>
      </section>
*/ }
      {/* Gallery Section */}
      <section id="gallery" className="bg-gray-800 py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-8">Game Gallery</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
          {/* images */}
          <img src="/images/donut_surivor_1.jpg" alt="Game Screenshot 1" className="w-full h-84 object-cover rounded-lg" />
          <img src="/images/game2_image.jpg" alt="Game Screenshot 2" className="w-full h-84 object-cover rounded-lg" />
          <img src="/images/coming_soon.jpg" alt="Game Screenshot 3" className="w-full h-84 object-cover rounded-lg" />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Contact Us</h2>
        <form className="max-w-xl mx-auto">
          <div className="mb-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:border-blue-500 border"
            />
          </div>
          <div className="mb-4">
            <textarea
              placeholder="Your message"
              rows={4}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:border-blue-500 border"
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors w-full"
          >
            Send Message
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-8 px-6 mt-16">
        <div className="container mx-auto text-center text-gray-300">
          <p>&copy; 2025 Sunday Night Games. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}