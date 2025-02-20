'use client';

import { useState } from "react";

export default function ContactSection() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | '';
    message: string;
  }>({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setStatus({
        type: 'success',
        message: 'Your message has been sent successfully!'
      });
      setEmail('');
      setMessage('');
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to send message'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="max-w-xl mx-auto" onSubmit={handleSubmit}>
      <div className="mb-4">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-600"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      <div className="mb-4">
        <textarea
          placeholder="Your message"
          rows={4}
          className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-600"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isSubmitting}
        ></textarea>
      </div>
      <button
        type="submit"
        className={`bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors w-full ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
      {status.message && (
        <p className={`text-center mt-4 ${
          status.type === 'success' ? 'text-green-400' : 'text-red-400'
        }`}>
          {status.message}
        </p>
      )}
    </form>
  );
} 