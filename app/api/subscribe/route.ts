import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  // Skip during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ message: 'Not available during build' }, { status: 200 });
  }

  // Dynamic imports to avoid build-time issues
  const { default: connectToDatabase } = await import('../../utils/db');
  const { sanitizeEmail, isValidEmail } = await import('../../utils/validation');
  try {
    const body = await request.json();
    let { email } = body;

    // Validate email presence
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Sanitize and validate email
    email = sanitizeEmail(email);
    
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const collection = db.collection('contacts');

    // Check if email already exists
    const existingContact = await collection.findOne({ email });

    if (existingContact) {
      return NextResponse.json(
        { message: 'You&apos;re already subscribed!' },
        { status: 200 }
      );
    }

    // Add new contact with sanitized email
    const dateAdded = new Date();
    await collection.insertOne({ 
      email, 
      dateAdded,
      source: 'mailing_list'
    });

    return NextResponse.json(
      { message: 'Subscription successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in subscription:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}
