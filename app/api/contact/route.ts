import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Initialize SendGrid only when the API is called
    const apiKey = process.env.SENDGRID_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;
    const senderEmail = process.env.VERIFIED_SENDER_EMAIL;

    // Debug: Check if environment variables are loaded (remove in production)
    console.log('Environment check:', {
      hasApiKey: !!apiKey,
      hasAdminEmail: !!adminEmail,
      hasSenderEmail: !!senderEmail,
      nodeEnv: process.env.NODE_ENV
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'SendGrid API key not configured in environment variables' },
        { status: 500 }
      );
    }

    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Admin email not configured in environment variables' },
        { status: 500 }
      );
    }

    if (!senderEmail) {
      return NextResponse.json(
        { error: 'Verified sender email not configured in environment variables' },
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
      to: adminEmail, // Your email address
      from: senderEmail, // Your verified SendGrid sender
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

    // Provide more specific error information
    let errorMessage = 'Failed to send message';
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        errorMessage = 'SendGrid API authentication failed. Check API key.';
      } else if (error.message.includes('403')) {
        errorMessage = 'SendGrid permission denied. Check sender email verification.';
      } else if (error.message.includes('550')) {
        errorMessage = 'Invalid recipient email address.';
      }
    }

    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 