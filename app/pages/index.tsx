import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  GameIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  const games = [
    { id: 1, title: 'Chess', description: 'Strategy board game' },
    { id: 2, title: 'UNO', description: 'Fast-paced card game' },
    // Add more games as needed
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-blue-600 text-white py-20 px-4"
      >
        <h1 className="text-4xl font-bold mb-4">Sunday Night Games</h1>
        <p className="text-xl mb-8">Join us for fun, friends, and games!</p>
        
        {/* Date Picker */}
        <div className="max-w-md mx-auto">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            minDate={new Date()}
            className="w-full p-3 rounded-lg bg-white text-gray-800"
            placeholderText="Select a date"
          />
        </div>
      </motion.div>

      {/* Games Section */}
      <section className="py-16 px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Games</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {games.map((game) => (
            <motion.div
              key={game.id}
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="flex items-center mb-4">
                <GameIcon className="w-8 h-8 text-blue-600 mr-2" />
                <h3 className="text-xl font-semibold">{game.title}</h3>
              </div>
              <p className="text-gray-600">{game.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-16 px-4 bg-white">
        <h2 className="text-3xl font-bold mb-8 text-center">Game Calendar</h2>
        
        {/* Add your calendar component here */}
        <div className="max-w-3xl mx-auto">
          <CalendarIcon className="w-16 h-16 text-blue-600 mx-auto mb-8" />
          <p className="text-gray-600">View our game schedule below!</p>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-gray-100">
        <h2 className="text-3xl font-bold mb-8 text-center">Stay Updated</h2>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="max-w-md mx-auto"
        >
          <div className="flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 p-3 rounded-lg"
            />
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg">
              Subscribe
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}