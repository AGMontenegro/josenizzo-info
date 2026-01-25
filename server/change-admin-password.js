import bcrypt from 'bcryptjs';
import db from './config/database.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import * as readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function validatePassword(password) {
  const errors = [];

  if (password.length < 12) {
    errors.push('- Debe tener al menos 12 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('- Debe incluir al menos una mayúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('- Debe incluir al menos una minúscula');
  }
  if (!/\d/.test(password)) {
    errors.push('- Debe incluir al menos un número');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('- Debe incluir al menos un caracter especial (!@#$%^&*(),.?":{}|<>)');
  }

  return errors;
}

async function changeAdminPassword() {
  console.log('\n🔐 CAMBIO DE CONTRASEÑA DE ADMINISTRADOR');
  console.log('=========================================\n');

  try {
    // Buscar usuario admin
    const admin = await db.getAsync("SELECT * FROM users WHERE role = 'admin' LIMIT 1");

    if (!admin) {
      console.log('❌ No se encontró ningún usuario administrador');
      process.exit(1);
    }

    console.log(`📧 Usuario admin encontrado: ${admin.email}\n`);

    // Pedir nueva contraseña
    console.log('Requisitos de la contraseña:');
    console.log('- Mínimo 12 caracteres');
    console.log('- Al menos una mayúscula');
    console.log('- Al menos una minúscula');
    console.log('- Al menos un número');
    console.log('- Al menos un caracter especial (!@#$%^&*(),.?":{}|<>)\n');

    const newPassword = await question('Nueva contraseña: ');

    // Validar contraseña
    const errors = validatePassword(newPassword);
    if (errors.length > 0) {
      console.log('\n❌ La contraseña no cumple los requisitos:');
      errors.forEach(e => console.log(e));
      rl.close();
      process.exit(1);
    }

    const confirmPassword = await question('Confirmar contraseña: ');

    if (newPassword !== confirmPassword) {
      console.log('\n❌ Las contraseñas no coinciden');
      rl.close();
      process.exit(1);
    }

    // Hash con salt alto para mayor seguridad
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Actualizar en la base de datos
    await db.runAsync(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, admin.id]
    );

    console.log('\n✅ Contraseña actualizada exitosamente!');
    console.log(`📧 Email: ${admin.email}`);
    console.log('🔒 La nueva contraseña está activa.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
    process.exit(0);
  }
}

changeAdminPassword();
