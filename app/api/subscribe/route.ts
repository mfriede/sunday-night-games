import { NextResponse } from 'next/server';
import connectToDatabase from '../../utils/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const collection = db.collection('contacts');

    // Check if email already exists
    const existingContact = await collection.findOne({ email });

    if (existingContact) {
      return NextResponse.json(
        { message: 'You\'re already subscribed!' },
        { status: 200 }
      );
    }

    // Add new contact
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
