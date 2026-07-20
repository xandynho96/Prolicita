import { Resend } from "resend";

/**
 * Envia um email transacional via Resend. Requer domínio verificado na
 * Resend para o remetente configurado em EMAIL_FROM — sem isso, a Resend
 * só entrega para o próprio email da conta (modo sandbox).
 */
export async function enviarEmail(
  destinatario: string,
  assunto: string,
  html: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const remetente = process.env.EMAIL_FROM;

  if (!apiKey || !remetente) {
    throw new Error("RESEND_API_KEY ou EMAIL_FROM não estão configurados");
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: remetente,
    to: destinatario,
    subject: assunto,
    html,
  });

  if (error) {
    throw new Error(`Resend respondeu com erro: ${error.message}`);
  }
}
