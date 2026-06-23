import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY no configurada');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }
    const resend = new Resend(apiKey);

    const { name, phone, service, message, lang } = await req.json();

    if (!name || !service) {
      return NextResponse.json(
        { error: 'Name and service are required' },
        { status: 400 }
      );
    }

    const subject =
      lang === 'en'
        ? `New partner inquiry from ${name}`
        : `Nueva solicitud de prestador: ${name}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0e4f4f;">${lang === 'en' ? 'New Partner Inquiry' : 'Nueva Solicitud de Prestador'}</h2>
        <hr style="border: 1px solid #e0e0e0;" />
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555; width: 140px;">${lang === 'en' ? 'Name' : 'Nombre'}:</td>
            <td style="padding: 8px 12px;">${name}</td>
          </tr>
          ${phone ? `<tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">${lang === 'en' ? 'Phone / WhatsApp' : 'Teléfono / WhatsApp'}:</td>
            <td style="padding: 8px 12px;">${phone}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">${lang === 'en' ? 'Service type' : 'Tipo de servicio'}:</td>
            <td style="padding: 8px 12px;">${service}</td>
          </tr>
          ${message ? `<tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">${lang === 'en' ? 'Message' : 'Mensaje'}:</td>
            <td style="padding: 8px 12px;">${message}</td>
          </tr>` : ''}
        </table>
        <hr style="border: 1px solid #e0e0e0; margin-top: 24px;" />
        <p style="color: #999; font-size: 12px; margin-top: 12px;">
          ${lang === 'en' ? 'Sent from RivieraMayaPass partner form' : 'Enviado desde el formulario de prestadores de RivieraMayaPass'}
        </p>
      </div>
    `;

    const fromAddress = process.env.RESEND_FROM_EMAIL || 'RivieraMayaPass <onboarding@resend.dev>';

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: ['contact@rivieramayapass.com'],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend error:', JSON.stringify(error));
      return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
