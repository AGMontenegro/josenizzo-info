import nodemailer from 'nodemailer';
import { renderNewsletter } from '../templates/index.js';

// Configuración del transporter de Nodemailer
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

// Email del remitente
const getFromEmail = () => {
  const user = process.env.GMAIL_USER;
  return `"Newsletter josenizzo.info" <${user}>`;
};

/**
 * Envía un email de bienvenida al suscriptor del newsletter
 */
export async function sendWelcomeEmail(email) {
  try {
    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: getFromEmail(),
      to: email,
      subject: '¡Bienvenido al Newsletter de josenizzo.info!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                border-bottom: 3px solid #111;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .logo {
                font-size: 28px;
                font-weight: bold;
                color: #111;
                font-family: Georgia, serif;
              }
              .content {
                margin-bottom: 30px;
              }
              .footer {
                border-top: 1px solid #ddd;
                padding-top: 20px;
                font-size: 12px;
                color: #666;
                text-align: center;
              }
              .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #111;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                margin-top: 20px;
              }
              a {
                color: #111;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">josenizzo.info</div>
            </div>

            <div class="content">
              <h2 style="color: #111; font-family: Georgia, serif;">¡Gracias por suscribirte!</h2>

              <p>Te damos la bienvenida al Newsletter Diario de <strong>josenizzo.info</strong>.</p>

              <p>Cada mañana recibirás en tu casilla las noticias más importantes del día:</p>

              <ul>
                <li>Política y Economía</li>
                <li>Análisis y Opinión</li>
                <li>Cultura y Sociedad</li>
                <li>Tecnología</li>
              </ul>

              <p>Nuestro compromiso es mantenerte informado con periodismo de calidad, sin spam.</p>

              <a href="https://josenizzo.info" class="button">Visitar josenizzo.info</a>
            </div>

            <div class="footer">
              <p>Recibiste este email porque te suscribiste al newsletter de josenizzo.info</p>
              <p>
                Si querés cancelar tu suscripción,
                <a href="https://josenizzo.info/desuscribirse?email=${encodeURIComponent(email)}" style="color: #111; text-decoration: underline;">
                  hacé clic aquí
                </a>
              </p>
              <p>&copy; ${new Date().getFullYear()} josenizzo.info - Todos los derechos reservados</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Email de bienvenida enviado:', info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error('Error en sendWelcomeEmail:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envía el newsletter a una lista de suscriptores
 */
export async function sendNewsletter(subscribers, articles, sendId, options = {}) {
  try {
    const { template = 'default', customTitle } = options;
    const transporter = getTransporter();

    const emailPromises = subscribers.map(async (subscriber) => {
      try {
        const html = renderNewsletter(template, {
          articles,
          subscriberEmail: subscriber.email,
          subscriberId: subscriber.id,
          sendId,
          customTitle
        });

        const info = await transporter.sendMail({
          from: getFromEmail(),
          to: subscriber.email,
          subject: `Newsletter Diario - ${new Date().toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}`,
          html,
        });

        return { email: subscriber.email, success: true, data: info };
      } catch (error) {
        console.error(`Error al enviar a ${subscriber.email}:`, error);
        return { email: subscriber.email, success: false, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`✅ Newsletter enviado: ${successful} exitosos, ${failed} fallidos`);
    return { successful, failed, results };
  } catch (error) {
    console.error('Error en sendNewsletter:', error);
    return { successful: 0, failed: subscribers.length, error: error.message };
  }
}

export default {
  sendWelcomeEmail,
  sendNewsletter,
};
