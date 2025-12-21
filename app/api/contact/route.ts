import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Initialize SendGrid only when the API is called
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'SendGrid API key not configured' },
        { status: 500 }
      );
    }
    sgMail.setApiKey(apiKey);

    const { email, message } = await request.json();

    // Validate inputs
    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email and message are required' },
        { status: 400 }
      );
    }

    // Prepare email data
    const msg = {
      to: process.env.ADMIN_EMAIL!, // Your email address
      from: process.env.VERIFIED_SENDER_EMAIL!, // Your verified SendGrid sender
      subject: 'New Contact Form Submission - Sunday Night Games',
      text: `New message from: ${email}\n\nMessage: ${message}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>From:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    // Send email
    await sgMail.send(msg);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 