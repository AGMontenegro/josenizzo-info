/**
 * Template compacto para newsletters - sin imágenes, más condensado
 */
export function compactTemplate(data) {
  const { articles, subscriberEmail, subscriberId, sendId, customTitle } = data;

  const articlesList = articles.map((article, index) => `
    <div style="margin-bottom: 20px; padding-bottom: 20px; ${index < articles.length - 1 ? 'border-bottom: 1px solid #eee;' : ''}">
      <h3 style="margin: 0 0 8px 0; font-family: Georgia, serif; font-size: 18px; line-height: 1.3;">
        <a href="https://josenizzo.info/articulo/${article.id}" style="color: #111; text-decoration: none;">
          ${article.title}
        </a>
      </h3>
      <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; line-height: 1.5;">
        ${article.excerpt.substring(0, 120)}${article.excerpt.length > 120 ? '...' : ''}
      </p>
      <div style="font-size: 11px; color: #999;">
        <span style="text-transform: uppercase; font-weight: 600;">${article.category}</span>
        <span style="margin: 0 6px;">•</span>
        <span>${new Date(article.created_at).toLocaleDateString('es-AR')}</span>
      </div>
    </div>
  `).join('');

  const trackingPixel = subscriberId && sendId
    ? `<img src="http://localhost:3001/api/newsletter/track/${subscriberId}/${sendId}" width="1" height="1" alt="" style="display:block;" />`
    : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
          }
          .container {
            background-color: white;
            padding: 30px;
            border: 1px solid #e0e0e0;
          }
          .header {
            border-bottom: 2px solid #111;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #111;
            font-family: Georgia, serif;
          }
          .date {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
          }
          .footer {
            border-top: 1px solid #ddd;
            padding-top: 15px;
            font-size: 11px;
            color: #666;
            text-align: center;
            margin-top: 30px;
          }
          a {
            color: #111;
          }
          @media only screen and (max-width: 600px) {
            body {
              padding: 10px;
            }
            .container {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">josenizzo.info</div>
            <div class="date">${new Date().toLocaleDateString('es-AR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</div>
          </div>

          <h2 style="margin-bottom: 25px; font-family: Georgia, serif; color: #111; font-size: 22px;">
            ${customTitle || 'Resumen del día'}
          </h2>

          ${articlesList}

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://josenizzo.info" style="display: inline-block; padding: 10px 20px; background-color: #111; color: white; text-decoration: none; font-size: 13px; font-weight: 600;">
              LEER MÁS EN JOSENIZZO.INFO
            </a>
          </div>

          <div class="footer">
            <p style="margin: 0 0 8px 0;">Recibiste este email porque estás suscrito al newsletter de josenizzo.info</p>
            <p style="margin: 0;">
              <a href="https://josenizzo.info" style="text-decoration: none;">Sitio web</a> |
              <a href="https://josenizzo.info/desuscribirse?email=${encodeURIComponent(subscriberEmail)}" style="text-decoration: none;">Cancelar suscripción</a>
            </p>
          </div>
          ${trackingPixel}
        </div>
      </body>
    </html>
  `;
}
