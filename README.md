# josenizzo.info

Portal de noticias y análisis de actualidad en Argentina y el mundo.

## Tecnologías

### Frontend
- **React 19** - Framework UI
- **Vite 7** - Build tool y dev server
- **React Router 7** - Routing
- **Tailwind CSS v4** - Estilos
- **date-fns** - Manejo de fechas

### Backend
- **Express 5** - Web framework
- **SQLite 3** - Base de datos
- **JWT** - Autenticación
- **bcryptjs** - Hashing de contraseñas
- **Multer** - Upload de archivos

## Estructura del Proyecto

```
josenizzo.info/
├── src/                    # Frontend (React)
│   ├── components/         # Componentes reutilizables
│   ├── pages/              # Páginas
│   │   ├── admin/          # Panel de administración
│   │   ├── Home.jsx
│   │   ├── ArticleDetail.jsx
│   │   └── Category.jsx
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   └── layouts/            # Layouts
├── server/                 # Backend (Express + SQLite)
│   ├── config/             # Configuración DB
│   ├── routes/             # Rutas API
│   ├── uploads/            # Imágenes subidas
│   ├── server.js           # Entry point
│   ├── migrate.js          # Script de migración
│   └── create-admin.js     # Script crear admin
├── public/                 # Archivos estáticos
└── dist/                   # Build de producción
```

## Instalación Local

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/josenizzo.info.git
cd josenizzo.info
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear la base de datos:
```bash
npm run migrate
```

4. Crear usuario administrador:
```bash
npm run create-admin
```

Credenciales por defecto:
- Email: admin@josenizzo.info
- Password: admin123

5. Iniciar en modo desarrollo:
```bash
npm start
```

Esto iniciará:
- Frontend: http://localhost:5174
- Backend API: http://localhost:3001

## Scripts Disponibles

- `npm run dev` - Inicia solo el frontend (Vite)
- `npm run server` - Inicia solo el backend
- `npm run server:dev` - Backend con auto-reload
- `npm start` - Inicia frontend + backend simultáneamente
- `npm run build` - Build de producción del frontend
- `npm run migrate` - Migrar artículos a la base de datos
- `npm run create-admin` - Crear usuario administrador
- `npm run fix-slugs` - Corregir slugs duplicados

## API Endpoints

### Artículos
- `GET /api/articles` - Lista de artículos (con paginación)
- `GET /api/articles/featured` - Artículos destacados
- `GET /api/articles/breaking` - Noticias urgentes
- `GET /api/articles/trending` - Artículos más leídos
- `GET /api/articles/:id` - Artículo por ID
- `GET /api/articles/slug/:slug` - Artículo por slug
- `POST /api/articles` - Crear artículo (requiere auth)
- `PUT /api/articles/:id` - Actualizar artículo (requiere auth)
- `DELETE /api/articles/:id` - Eliminar artículo (requiere auth)

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obtener usuario actual (requiere auth)

### Newsletter
- `POST /api/newsletter/subscribe` - Suscribirse
- `POST /api/newsletter/unsubscribe` - Cancelar suscripción

### Comentarios
- `GET /api/comments/:articleId` - Comentarios de un artículo
- `POST /api/comments` - Crear comentario
- `PUT /api/comments/:id/approve` - Aprobar comentario (admin)
- `DELETE /api/comments/:id` - Eliminar comentario (admin)

## Panel de Administración

Accede al panel en: http://localhost:5174/admin/login

### Funcionalidades
- Dashboard con estadísticas
- Listado de artículos con filtros y búsqueda
- Gestión de artículos (crear, editar, eliminar)
- Ver estadísticas de vistas
- Marcar artículos como destacados o urgentes

## Despliegue

Ver [DEPLOY.md](./DEPLOY.md) para instrucciones detalladas de despliegue en DonWeb.

### Resumen rápido:

1. Build del frontend: `npm run build`
2. Subir archivos al servidor
3. Instalar dependencias: `npm install --production`
4. Configurar variables de entorno (`.env`)
5. Crear base de datos: `npm run migrate`
6. Crear admin: `npm run create-admin`
7. Iniciar con PM2: `pm2 start ecosystem.config.js`
8. Configurar Nginx como reverse proxy

## Variables de Entorno

### Desarrollo (`.env`)
```
PORT=3001
NODE_ENV=development
JWT_SECRET=tu-secreto-jwt
```

### Producción (`.env` en servidor)
```
PORT=3001
NODE_ENV=production
JWT_SECRET=secreto-seguro-aleatorio-32-caracteres-minimo
```

### Frontend (`.env.local`)
```
VITE_API_URL=http://localhost:3001/api
```

### Frontend Producción (`.env.production.local`)
```
VITE_API_URL=https://tu-dominio.com/api
```

## Funcionalidades del Sitio

### Público
- ✅ Homepage con artículos destacados
- ✅ Barra de noticias urgentes
- ✅ Búsqueda en tiempo real
- ✅ Categorías (Economía, Política, Tecnología, etc.)
- ✅ Vista detallada de artículos
- ✅ Compartir en redes sociales
- ✅ SEO optimizado
- ✅ Diseño responsive
- ✅ Newsletter

### Administración
- ✅ Login seguro con JWT
- ✅ Dashboard con estadísticas
- ✅ Gestión completa de artículos
- ✅ Filtros y búsqueda
- ✅ Paginación
- ✅ Vista previa de artículos

## Seguridad

- Autenticación JWT
- Contraseñas hasheadas con bcrypt
- Validación de inputs
- Protección CORS configurada
- Sanitización de contenido HTML
- HTTPS en producción

## Próximas Funcionalidades

- [ ] Editor WYSIWYG para artículos
- [ ] Sistema de tags
- [ ] Moderación de comentarios
- [ ] Analytics integrado
- [ ] Sistema de notificaciones
- [ ] Upload de imágenes desde el admin
- [ ] Multi-idioma
- [ ] Dark mode

## Licencia

Copyright © 2025 josenizzo.info - Todos los derechos reservados

## Contacto

- Web: https://josenizzo.info
- Email: admin@josenizzo.info

## Agradecimientos

Desarrollado con ❤️ usando las mejores tecnologías open source.
