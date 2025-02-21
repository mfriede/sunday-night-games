'use client';

import { useState } from 'react';
import { sanitizeEmail, isValidEmail } from '../utils/validation';

export default function MailingListSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | '';
    message: string;
  }>({ type: '', message: '' });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Sanitize and validate email
    const sanitizedEmail = sanitizeEmail(email);
    
    if (!isValidEmail(sanitizedEmail)) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid email address.'
      });
      return;
    }

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sanitizedEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: data.message || 'Thanks for subscribing! We&apos;ll keep you updated.'
        });
        setEmail('');
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Failed to subscribe. Please try again.'
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'An error occurred. Please try again later.'
      });
    }
  };

  return (
    <section className="bg-gray-800 py-16 px-6 mt-16">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-8">Stay Updated</h2>
        <p className="text-gray-300 mb-8">
          Sign up for our mailing list to receive updates about new games and features.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Subscribe
          </button>
          <p className="text-sm text-gray-400 mt-4">
            We respect your privacy. We won&apos;t spam you or sell your email address.
          </p>
        </form>
        {status.message && (
          <p className={`mt-4 ${
            status.type === 'success' ? 'text-green-400' : 'text-red-400'
          }`}>
            {status.message}
          </p>
        )}
      </div>
    </section>
  );
} 