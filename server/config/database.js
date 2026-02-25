import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const DB_TYPE = process.env.DB_TYPE || 'sqlite';

let db;
let dbType = DB_TYPE;
let dbReady = null; // Promise que resuelve cuando la DB está lista

// Wrapper para unificar la interfaz de SQLite y MySQL
class DatabaseWrapper {
  constructor(connection, type) {
    this.connection = connection;
    this.type = type;
  }

  async runAsync(sql, params = []) {
    if (this.type === 'mysql') {
      const [result] = await this.connection.execute(sql, params);
      return result;
    } else {
      return new Promise((resolve, reject) => {
        this.connection.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    }
  }

  async getAsync(sql, params = []) {
    if (this.type === 'mysql') {
      const [rows] = await this.connection.execute(sql, params);
      return rows[0];
    } else {
      return new Promise((resolve, reject) => {
        this.connection.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }
  }

  async allAsync(sql, params = []) {
    if (this.type === 'mysql') {
      const [rows] = await this.connection.execute(sql, params);
      return rows;
    } else {
      return new Promise((resolve, reject) => {
        this.connection.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    }
  }
}

async function initializeMySQL() {
  try {
    // Cargar certificado SSL de DigitalOcean
    const caCertPath = path.join(__dirname, '..', '..', 'public', 'certs', 'ca-certificate.crt');
    let sslConfig = false;

    if (process.env.MYSQL_SSL === 'true') {
      if (fs.existsSync(caCertPath)) {
        sslConfig = {
          ca: fs.readFileSync(caCertPath),
          rejectUnauthorized: true
        };
        console.log('🔒 Usando certificado SSL:', caCertPath);
      } else {
        sslConfig = { rejectUnauthorized: false };
        console.log('⚠️ Certificado no encontrado, usando SSL sin verificación');
      }
    }

    const connection = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT) || 25060,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      ssl: sslConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    await connection.execute('SELECT 1');
    console.log('✅ Conectado a MySQL (DigitalOcean)');

    return new DatabaseWrapper(connection, 'mysql');
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    throw error;
  }
}

function initializeSQLite() {
  return new Promise((resolve, reject) => {
    const DB_PATH = path.join(__dirname, '..', 'josenizzo.db');
    const sqliteDb = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Error al conectar con SQLite:', err);
        reject(err);
      } else {
        console.log('✅ Conectado a SQLite local');
        resolve(new DatabaseWrapper(sqliteDb, 'sqlite'));
      }
    });
  });
}

async function initializeTables(db) {
  const isMySQL = db.type === 'mysql';

  // Sintaxis adaptada para MySQL vs SQLite
  const autoIncrement = isMySQL ? 'AUTO_INCREMENT' : 'AUTOINCREMENT';
  const intType = isMySQL ? 'INT' : 'INTEGER';
  const textType = isMySQL ? 'TEXT' : 'TEXT';
  const boolType = isMySQL ? 'TINYINT(1)' : 'BOOLEAN';
  const dateType = isMySQL ? 'DATETIME DEFAULT CURRENT_TIMESTAMP' : 'DATETIME DEFAULT CURRENT_TIMESTAMP';

  try {
    // Tabla de usuarios
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id ${intType} PRIMARY KEY ${autoIncrement},
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'reader',
        created_at ${dateType},
        updated_at ${dateType}
      )
    `);

    // Tabla de artículos
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS articles (
        id ${intType} PRIMARY KEY ${autoIncrement},
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        excerpt ${textType},
        content LONGTEXT NOT NULL,
        image VARCHAR(1000),
        category VARCHAR(100) NOT NULL,
        author_id ${intType},
        author_name VARCHAR(255) NOT NULL,
        featured ${boolType} DEFAULT 0,
        breaking ${boolType} DEFAULT 0,
        badge VARCHAR(50),
        read_time ${intType},
        views ${intType} DEFAULT 0,
        published ${boolType} DEFAULT 1,
        created_at ${dateType},
        updated_at ${dateType}
      )
    `);

    // Tabla de comentarios
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS comments (
        id ${intType} PRIMARY KEY ${autoIncrement},
        article_id ${intType} NOT NULL,
        user_id ${intType} NOT NULL,
        content ${textType} NOT NULL,
        approved ${boolType} DEFAULT 0,
        created_at ${dateType}
      )
    `);

    // Tabla de newsletter
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS newsletter (
        id ${intType} PRIMARY KEY ${autoIncrement},
        email VARCHAR(255) UNIQUE NOT NULL,
        active ${boolType} DEFAULT 1,
        created_at ${dateType}
      )
    `);

    // Tabla de tags
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS tags (
        id ${intType} PRIMARY KEY ${autoIncrement},
        name VARCHAR(100) UNIQUE NOT NULL
      )
    `);

    // Tabla relación artículos-tags
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS article_tags (
        article_id ${intType} NOT NULL,
        tag_id ${intType} NOT NULL,
        PRIMARY KEY (article_id, tag_id)
      )
    `);

    // Tabla de envíos de newsletter
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS newsletter_sends (
        id ${intType} PRIMARY KEY ${autoIncrement},
        sent_at ${dateType},
        article_count ${intType} NOT NULL,
        subscriber_count ${intType} NOT NULL
      )
    `);

    // Tabla de aperturas de newsletter
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS newsletter_opens (
        id ${intType} PRIMARY KEY ${autoIncrement},
        subscriber_id ${intType} NOT NULL,
        send_id ${intType} NOT NULL,
        opened_at ${dateType}
      )
    `);

    // Tabla de suscripciones push
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id ${intType} PRIMARY KEY ${autoIncrement},
        endpoint VARCHAR(768) UNIQUE NOT NULL,
        p256dh ${textType} NOT NULL,
        auth VARCHAR(500) NOT NULL,
        created_at ${dateType},
        updated_at ${dateType}
      )
    `);

    // Tabla de page views (analytics)
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS page_views (
        id ${intType} PRIMARY KEY ${autoIncrement},
        path VARCHAR(500) NOT NULL,
        article_id ${intType},
        referrer VARCHAR(1000),
        user_agent VARCHAR(500),
        ip_hash VARCHAR(45),
        duration ${intType} DEFAULT 0,
        created_at ${dateType}
      )
    `);

    // Tabla de suscripciones premium
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id ${intType} PRIMARY KEY ${autoIncrement},
        user_id ${intType} NOT NULL,
        plan VARCHAR(50) NOT NULL DEFAULT 'monthly',
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        payment_provider VARCHAR(50),
        payment_id VARCHAR(255),
        amount DECIMAL(10,2),
        currency VARCHAR(10) DEFAULT 'USD',
        starts_at ${dateType} NOT NULL,
        expires_at ${dateType} NOT NULL,
        cancelled_at ${dateType},
        created_at ${dateType},
        updated_at ${dateType}
      )
    `);

    // Índices para suscripciones
    if (isMySQL) {
      try {
        await db.runAsync('CREATE INDEX idx_subs_user ON subscriptions(user_id)');
      } catch (e) { /* ya existe */ }
      try {
        await db.runAsync('CREATE INDEX idx_subs_status ON subscriptions(status)');
      } catch (e) { /* ya existe */ }
      try {
        await db.runAsync('CREATE INDEX idx_subs_expires ON subscriptions(expires_at)');
      } catch (e) { /* ya existe */ }
    }

    // Migraciones: agregar columnas y índices si no existen
    if (isMySQL) {
      // Columna image_blur para blur placeholders
      try {
        await db.runAsync('ALTER TABLE articles ADD COLUMN image_blur TEXT');
      } catch (e) {
        // Columna ya existe, ignorar
      }

      // FULLTEXT index para búsqueda
      try {
        await db.runAsync('ALTER TABLE articles ADD FULLTEXT INDEX ft_search (title, excerpt)');
      } catch (e) {
        // Índice ya existe, ignorar
      }

      // Migrar columnas push_subscriptions si tienen nombres viejos
      try {
        await db.runAsync('ALTER TABLE push_subscriptions CHANGE COLUMN keys_p256dh p256dh TEXT NOT NULL');
      } catch (e) { /* ya migrado o no existe */ }
      try {
        await db.runAsync('ALTER TABLE push_subscriptions CHANGE COLUMN keys_auth auth VARCHAR(500) NOT NULL');
      } catch (e) { /* ya migrado o no existe */ }
      try {
        await db.runAsync('ALTER TABLE push_subscriptions ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP');
      } catch (e) { /* ya existe */ }

      // Migrar columnas page_views si tienen nombres viejos
      try {
        await db.runAsync('ALTER TABLE page_views CHANGE COLUMN ip ip_hash VARCHAR(45)');
      } catch (e) { /* ya migrado o no existe */ }
      try {
        await db.runAsync('ALTER TABLE page_views ADD COLUMN duration INT DEFAULT 0');
      } catch (e) { /* ya existe */ }
    }

    console.log('✅ Tablas de base de datos inicializadas');
  } catch (error) {
    console.error('❌ Error al inicializar tablas:', error);
    throw error;
  }
}

// Inicializar la base de datos con reintentos
async function initializeDatabase() {
  const maxRetries = 6;
  const baseDelay = 5000; // 5 segundos base

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (DB_TYPE === 'mysql') {
        db = await initializeMySQL();
      } else {
        db = await initializeSQLite();
      }

      await initializeTables(db);
      return db;
    } catch (error) {
      console.error(`❌ Error al inicializar base de datos (intento ${attempt}/${maxRetries}):`, error.message);

      if (attempt < maxRetries) {
        const delay = baseDelay * attempt; // 5s, 10s, 15s, 20s, 25s
        console.log(`⏳ Reintentando conexión en ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('❌ No se pudo conectar a la base de datos después de todos los intentos.');
        throw error;
      }
    }
  }
}

// Obtener la instancia de DB, reintentando si la conexión anterior falló
async function getDatabase() {
  if (db) return db;
  if (!dbReady) {
    dbReady = initializeDatabase().catch(err => {
      dbReady = null; // Permitir nuevo intento en la próxima llamada
      throw err;
    });
  }
  return dbReady;
}

// Iniciar conexión al arrancar
dbReady = initializeDatabase().then(result => {
  db = result;
  return result;
}).catch(err => {
  dbReady = null;
  console.error('❌ Fallo definitivo al conectar la base de datos:', err.message);
});

export default {
  async runAsync(...args) {
    const database = await getDatabase();
    return database.runAsync(...args);
  },
  async getAsync(...args) {
    const database = await getDatabase();
    return database.getAsync(...args);
  },
  async allAsync(...args) {
    const database = await getDatabase();
    return database.allAsync(...args);
  },
  getType() {
    return dbType;
  }
};
