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

    console.log('✅ Tablas de base de datos inicializadas');
  } catch (error) {
    console.error('❌ Error al inicializar tablas:', error);
    throw error;
  }
}

// Inicializar la base de datos
async function initializeDatabase() {
  try {
    if (DB_TYPE === 'mysql') {
      db = await initializeMySQL();
    } else {
      db = await initializeSQLite();
    }

    await initializeTables(db);
    return db;
  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error);
    throw error;
  }
}

// Inicializar y exportar
const dbPromise = initializeDatabase();

export { dbPromise };
export default {
  async runAsync(...args) {
    const database = await dbPromise;
    return database.runAsync(...args);
  },
  async getAsync(...args) {
    const database = await dbPromise;
    return database.getAsync(...args);
  },
  async allAsync(...args) {
    const database = await dbPromise;
    return database.allAsync(...args);
  },
  getType() {
    return dbType;
  }
};
