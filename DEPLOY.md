# Guía de Despliegue para DonWeb

Esta guía te ayudará a desplegar josenizzo.info en DonWeb.

## Requisitos Previos

- Cuenta en DonWeb con plan de hosting Node.js
- Acceso SSH al servidor
- Node.js 18+ instalado en el servidor
- Git instalado

## Archivos Importantes

- `server/` - Backend API (Express + SQLite)
- `dist/` - Frontend compilado (después de build)
- `.env.production` - Variables de entorno para producción
- `package.json` - Dependencias del proyecto

## Pasos para Desplegar

### 1. Preparar el Frontend

```bash
# En tu máquina local
npm run build
```

Esto generará la carpeta `dist/` con los archivos estáticos optimizados.

### 2. Configurar Variables de Entorno

**En tu servidor DonWeb**, crea el archivo `.env` en el directorio raíz:

```bash
PORT=3001
NODE_ENV=production
JWT_SECRET=TU_SECRETO_SUPER_SEGURO_Y_ALEATORIO_DE_32_CARACTERES_MINIMO
```

**IMPORTANTE:** Cambia `JWT_SECRET` por una clave aleatoria segura. Puedes generarla con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Subir Archivos al Servidor

Opción A: **Via FTP/SFTP**
- Sube toda la carpeta del proyecto a tu directorio en DonWeb
- Asegúrate de incluir: `server/`, `dist/`, `package.json`, `.env`

Opción B: **Via Git (Recomendado)**
```bash
# En el servidor DonWeb (via SSH)
git clone https://github.com/tu-usuario/josenizzo.info.git
cd josenizzo.info
```

### 4. Instalar Dependencias

```bash
# En el servidor via SSH
npm install --production
```

### 5. Configurar la Base de Datos

```bash
# Crear la base de datos (solo primera vez)
npm run migrate
```

```bash
# Crear usuario administrador (solo primera vez)
npm run create-admin
```

Esto creará:
- Email: admin@josenizzo.info
- Password: admin123 (CÁMBIALO INMEDIATAMENTE)

### 6. Configurar Servicio Express

DonWeb usualmente usa PM2 para manejar procesos Node.js.

Crea `ecosystem.config.js` en el directorio raíz:

```javascript
module.exports = {
  apps: [{
    name: 'josenizzo-api',
    script: './server/server.js',
    instances: 1,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```

Iniciar el servidor:

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 7. Configurar Nginx (Reverse Proxy)

DonWeb usualmente provee un panel para configurar dominios. Configura:

**Para el frontend (archivos estáticos):**
- Directorio raíz: `/tu-ruta/josenizzo.info/dist`
- Index: `index.html`

**Para el API (proxy):**
Agrega una regla de proxy en `/api`:

```nginx
location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

**Configuración completa de ejemplo:**

```nginx
server {
    listen 80;
    server_name josenizzo.info www.josenizzo.info;

    # Frontend estático
    location / {
        root /ruta/a/josenizzo.info/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Archivos de uploads (imágenes subidas desde el admin)
    location /uploads {
        alias /ruta/a/josenizzo.info/server/uploads;
    }
}
```

### 8. Configurar HTTPS con SSL

DonWeb usualmente provee certificados SSL gratuitos con Let's Encrypt.

Desde el panel de DonWeb:
1. Ve a "Certificados SSL"
2. Selecciona "Let's Encrypt"
3. Genera el certificado para tu dominio

Esto debería actualizar la configuración de Nginx automáticamente para usar HTTPS.

### 9. Verificar que Todo Funciona

```bash
# Verificar que el servidor está corriendo
pm2 status

# Ver logs del servidor
pm2 logs josenizzo-api

# Verificar que el API responde
curl http://localhost:3001/api/health

# Verificar desde internet
curl https://josenizzo.info/api/health
```

## Actualizar el Sitio

Cuando hagas cambios:

### Frontend
```bash
# En tu máquina local
npm run build

# Sube los archivos de dist/ via FTP/SFTP al servidor
# O via git:
git push origin main

# En el servidor
git pull origin main
```

### Backend
```bash
# En el servidor
git pull origin main  # Si usas git
npm install --production  # Solo si hay nuevas dependencias
pm2 restart josenizzo-api
```

## Estructura de Archivos en el Servidor

```
/home/tu-usuario/josenizzo.info/
├── dist/                    # Frontend compilado
│   ├── index.html
│   ├── assets/
│   └── ...
├── server/                  # Backend
│   ├── server.js
│   ├── config/
│   ├── routes/
│   ├── josenizzo.db        # Base de datos SQLite
│   └── uploads/            # Imágenes subidas
├── .env                     # Variables de entorno (NO SUBIR A GIT)
├── package.json
└── ecosystem.config.js      # Configuración PM2
```

## Comandos Útiles

```bash
# Ver estado del servidor
pm2 status

# Ver logs en tiempo real
pm2 logs

# Reiniciar el servidor
pm2 restart josenizzo-api

# Detener el servidor
pm2 stop josenizzo-api

# Ver métricas de rendimiento
pm2 monit

# Backup de la base de datos
cp server/josenizzo.db server/josenizzo.db.backup-$(date +%Y%m%d)
```

## Solución de Problemas

### El API no responde
```bash
pm2 logs josenizzo-api  # Ver errores
pm2 restart josenizzo-api  # Reiniciar
```

### Error de permisos en la base de datos
```bash
chmod 664 server/josenizzo.db
chown tu-usuario:www-data server/josenizzo.db
```

### El frontend muestra página en blanco
- Verifica que los archivos de `dist/` estén completos
- Revisa la configuración de Nginx
- Verifica en la consola del navegador si hay errores de CORS

### Error 502 Bad Gateway
- El servidor Node.js no está corriendo: `pm2 start ecosystem.config.js`
- Verifica que el puerto 3001 esté disponible
- Revisa la configuración del proxy en Nginx

## Seguridad

1. **Cambia el JWT_SECRET** en `.env` por uno aleatorio y seguro
2. **Cambia la contraseña del admin** después del primer login
3. **Mantén actualizadas las dependencias**: `npm update`
4. **Haz backups regulares** de `server/josenizzo.db`
5. **Usa HTTPS** siempre en producción
6. **No subas `.env` a Git** (ya está en `.gitignore`)

## Contacto de Soporte

- Soporte DonWeb: https://donweb.com/es-ar/soporte
- Documentación Node.js en DonWeb: https://donweb.com/es-ar/ayuda/nodejs

## Checklist de Despliegue

- [ ] Build del frontend (`npm run build`)
- [ ] Archivos subidos al servidor
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Dependencias instaladas (`npm install --production`)
- [ ] Base de datos creada (`npm run migrate`)
- [ ] Usuario admin creado (`npm run create-admin`)
- [ ] Servidor corriendo con PM2
- [ ] Nginx configurado (frontend + API)
- [ ] SSL/HTTPS activado
- [ ] Verificación de endpoints funcionando
- [ ] Cambiar contraseña del admin
- [ ] Backup inicial de la base de datos
