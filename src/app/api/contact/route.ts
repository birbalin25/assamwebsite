import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message, recipientEmail, resendApiKey: clientKey } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Try env var first, then key passed from client (stored in Firestore siteConfig)
    const apiKey = process.env.RESEND_API_KEY || clientKey;
    if (!apiKey) {
      console.log('No Resend API key available. Message saved to Firestore only.');
      return NextResponse.json({ success: true, emailSent: false });
    }

    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    const to = recipientEmail || process.env.CONTACT_EMAIL || 'dfwassamese@gmail.com';

    await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to,
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    });

    return NextResponse.json({ success: true, emailSent: true });
  } catch (error) {
    console.error('Contact email error:', error);
    return NextResponse.json({ success: true, emailSent: false });
  }
}
