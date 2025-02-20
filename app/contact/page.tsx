'use client';

import Navbar from '../components/Navbar';
import ContactSection from '../components/ContactSection';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>
          <p className="text-center text-gray-300 mb-12">
            Have questions, feedback, or just want to say hello? We'd love to hear from you! 
            Fill out the form below and we'll get back to you as soon as possible.
          </p>
          <div className="bg-gray-800 p-8 rounded-lg">
            <ContactSection />
          </div>
        </div>
      </div>
    </div>
  );
} 