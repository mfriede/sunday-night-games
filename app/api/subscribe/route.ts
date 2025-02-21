import { NextResponse } from 'next/server';
import connectToDatabase from '../../utils/db';
import { sanitizeEmail, isValidEmail } from '../../utils/validation';

export async function POST(request: Request) {
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
