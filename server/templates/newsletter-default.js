/**
 * Template por defecto para newsletters
 */
export function defaultTemplate(data) {
  const { articles, subscriberEmail, subscriberId, sendId, customTitle } = data;

  const articlesList = articles.map(article => `
    <div style="margin-bottom: 30px; padding-bottom: 30px; border-bottom: 1px solid #eee;">
      ${article.image ? `
        <img src="${article.image}" alt="${article.title}" style="width: 100%; max-width: 600px; height: auto; margin-bottom: 15px; border-radius: 4px;" />
      ` : ''}
      <h3 style="margin: 0 0 10px 0; font-family: Georgia, serif; font-size: 20px;">
        <a href="https://josenizzo.info/articulo/${article.id}" style="color: #111; text-decoration: none;">
          ${article.title}
        </a>
      </h3>
      <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
        ${article.excerpt}
      </p>
      <div style="margin-top: 10px;">
        <span style="display: inline-block; padding: 4px 8px; background-color: #f0f0f0; color: #666; font-size: 12px; border-radius: 3px; margin-right: 8px;">
          ${article.category}
        </span>
        <span style="color: #999; font-size: 12px;">
          ${new Date(article.created_at).toLocaleDateString('es-AR')}
        </span>
      </div>
      <a href="https://josenizzo.info/articulo/${article.id}" style="display: inline-block; margin-top: 12px; color: #111; font-size: 14px; font-weight: 600; text-decoration: none;">
        Leer más →
      </a>
    </div>
  `).join('');

  // Tracking pixel
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
            background-color: #f9f9f9;
          }
          .container {
            background-color: white;
            padding: 40px;
            border-radius: 8px;
          }
          .header {
            border-bottom: 3px solid #111;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #111;
            font-family: Georgia, serif;
          }
          .date {
            font-size: 14px;
            color: #666;
            margin-top: 10px;
          }
          .footer {
            border-top: 1px solid #ddd;
            padding-top: 20px;
            font-size: 12px;
            color: #666;
            text-align: center;
            margin-top: 40px;
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

          <h2 style="margin-bottom: 30px; font-family: Georgia, serif; color: #111;">
            ${customTitle || 'Las noticias del día'}
          </h2>

          ${articlesList}

          <div style="text-align: center; margin-top: 40px;">
            <a href="https://josenizzo.info" style="display: inline-block; padding: 12px 24px; background-color: #111; color: white; text-decoration: none; border-radius: 4px;">
              Ver más noticias
            </a>
          </div>

          <div class="footer">
            <p>Recibiste este email porque estás suscrito al newsletter de josenizzo.info</p>
            <p>
              <a href="https://josenizzo.info">Visitar josenizzo.info</a> |
              <a href="https://josenizzo.info/desuscribirse?email=${encodeURIComponent(subscriberEmail)}" style="color: #111;">Cancelar suscripción</a>
            </p>
            <p>&copy; ${new Date().getFullYear()} josenizzo.info - Todos los derechos reservados</p>
          </div>
          ${trackingPixel}
        </div>
      </body>
    </html>
  `;
}
