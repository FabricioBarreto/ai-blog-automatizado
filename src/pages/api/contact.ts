import type { APIRoute } from "astro";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    const { name, email, subject, message } = data;

    // Validación básica (Google odia forms rotos)
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: "Campos incompletos" }), {
        status: 400,
      });
    }

    await resend.emails.send({
      from: "AI Tools Hub <onboarding@resend.dev>",
      to: [import.meta.env.CONTACT_EMAIL],
      replyTo: email,
      subject: `📩 Nuevo mensaje: ${subject}`,
      html: `
        <h2>Nuevo mensaje desde el sitio</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Asunto:</strong> ${subject}</p>
        <hr />
        <p>${message.replace(/\n/g, "<br/>")}</p>
      `,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Error enviando el mensaje" }),
      { status: 500 }
    );
  }
};
