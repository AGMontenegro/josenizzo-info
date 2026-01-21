import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('\n🔍 Probando conexión a DigitalOcean MySQL...\n');
console.log('Host:', process.env.MYSQL_HOST);
console.log('Port:', process.env.MYSQL_PORT);
console.log('User:', process.env.MYSQL_USER);
console.log('Database:', process.env.MYSQL_DATABASE);
console.log('SSL:', process.env.MYSQL_SSL);
console.log('');

import db from './config/database.js';

async function testConnection() {
  try {
    // Test 1: Verificar conexión
    console.log('📡 Test 1: Verificando conexión...');
    const result = await db.getAsync('SELECT 1 as test');
    console.log('✅ Conexión exitosa:', result);

    // Test 2: Listar tablas
    console.log('\n📋 Test 2: Listando tablas...');
    const tables = await db.allAsync('SHOW TABLES');
    console.log('✅ Tablas encontradas:', tables.length);
    tables.forEach(t => console.log('   -', Object.values(t)[0]));

    // Test 3: Insertar un registro de prueba
    console.log('\n✏️ Test 3: Insertando registro de prueba en newsletter...');
    try {
      await db.runAsync(
        'INSERT INTO newsletter (email, active) VALUES (?, ?)',
        ['test-connection@josenizzo.info', 1]
      );
      console.log('✅ Registro insertado correctamente');
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log('⚠️ El registro ya existe (esto es normal)');
      } else {
        throw err;
      }
    }

    // Test 4: Leer el registro
    console.log('\n📖 Test 4: Leyendo registro de prueba...');
    const record = await db.getAsync(
      'SELECT * FROM newsletter WHERE email = ?',
      ['test-connection@josenizzo.info']
    );
    console.log('✅ Registro leído:', record);

    // Test 5: Eliminar el registro de prueba
    console.log('\n🗑️ Test 5: Eliminando registro de prueba...');
    await db.runAsync(
      'DELETE FROM newsletter WHERE email = ?',
      ['test-connection@josenizzo.info']
    );
    console.log('✅ Registro eliminado correctamente');

    console.log('\n✨ ¡Todas las pruebas pasaron! La conexión a DigitalOcean funciona correctamente.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testConnection();
