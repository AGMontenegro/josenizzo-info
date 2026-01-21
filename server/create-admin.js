import db from './config/database.js';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  const email = 'admin@josenizzo.info';
  const password = 'admin123';  // CAMBIAR EN PRODUCCIÓN
  const name = 'Administrador';

  try {
    console.log('🔐 Creando usuario administrador...\n');

    // Verificar si ya existe
    const existing = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);

    if (existing) {
      console.log('⚠️  El usuario admin ya existe');
      console.log(`   Email: ${email}`);
      console.log(`   ID: ${existing.id}`);
      console.log(`   Rol: ${existing.role}\n`);

      // Actualizar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.runAsync(
        'UPDATE users SET password = ?, role = ? WHERE email = ?',
        [hashedPassword, 'admin', email]
      );
      console.log('✅ Contraseña actualizada\n');
    } else {
      // Crear nuevo admin
      const hashedPassword = await bcrypt.hash(password, 10);

      await db.runAsync(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, name, 'admin']
      );

      console.log('✅ Usuario administrador creado exitosamente!\n');
    }

    console.log('📧 Credenciales de acceso:');
    console.log(`   Email: ${email}`);
    console.log(`   Contraseña: ${password}`);
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login\n');
    console.log('🔗 Accede al panel en: http://localhost:5174/admin/login\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear admin:', error);
    process.exit(1);
  }
}

createAdmin();
