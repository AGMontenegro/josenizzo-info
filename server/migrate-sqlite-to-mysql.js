import sqlite3 from 'sqlite3';
import mysql from 'mysql2/promise';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Configuración
const SQLITE_PATH = path.join(__dirname, 'josenizzo.db');
const BATCH_SIZE = 100; // Insertar en lotes para evitar timeout

async function getMySQLConnection() {
  // Cargar certificado SSL
  const caCertPath = path.join(__dirname, '..', 'public', 'certs', 'ca-certificate.crt');
  let sslConfig = false;

  if (process.env.MYSQL_SSL === 'true') {
    if (fs.existsSync(caCertPath)) {
      sslConfig = {
        ca: fs.readFileSync(caCertPath),
        rejectUnauthorized: true
      };
      console.log('🔒 Usando certificado SSL');
    } else {
      sslConfig = { rejectUnauthorized: false };
      console.log('⚠️ SSL sin verificación de certificado');
    }
  }

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT) || 25060,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    ssl: sslConfig
  });

  console.log('✅ Conectado a MySQL (DigitalOcean)');
  return connection;
}

function getSQLiteDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(SQLITE_PATH, (err) => {
      if (err) reject(err);
      else {
        console.log('✅ Conectado a SQLite local');
        resolve(db);
      }
    });
  });
}

function sqliteAll(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function migrateUsers(sqliteDb, mysqlConn) {
  console.log('\n📦 Migrando usuarios...');

  const users = await sqliteAll(sqliteDb, 'SELECT * FROM users');
  console.log(`   Encontrados: ${users.length} usuarios`);

  for (const user of users) {
    try {
      await mysqlConn.execute(
        `INSERT INTO users (id, email, password, name, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role)`,
        [user.id, user.email, user.password, user.name, user.role, user.created_at, user.updated_at]
      );
    } catch (error) {
      console.error(`   ❌ Error con usuario ${user.email}:`, error.message);
    }
  }
  console.log(`   ✅ Usuarios migrados`);
}

async function migrateArticles(sqliteDb, mysqlConn) {
  console.log('\n📦 Migrando artículos...');

  const articles = await sqliteAll(sqliteDb, 'SELECT * FROM articles ORDER BY id');
  console.log(`   Encontrados: ${articles.length} artículos`);

  let migrated = 0;
  let errors = 0;

  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);

    for (const article of batch) {
      try {
        await mysqlConn.execute(
          `INSERT INTO articles (id, title, slug, excerpt, content, image, category, author_id, author_name, featured, breaking, badge, read_time, views, published, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             title=VALUES(title),
             content=VALUES(content),
             excerpt=VALUES(excerpt),
             image=VALUES(image),
             category=VALUES(category),
             featured=VALUES(featured),
             breaking=VALUES(breaking),
             views=VALUES(views)`,
          [
            article.id,
            article.title,
            article.slug,
            article.excerpt,
            article.content,
            article.image,
            article.category,
            article.author_id,
            article.author_name,
            article.featured ? 1 : 0,
            article.breaking ? 1 : 0,
            article.badge,
            article.read_time,
            article.views || 0,
            article.published !== undefined ? (article.published ? 1 : 0) : 1,
            article.created_at,
            article.updated_at
          ]
        );
        migrated++;
      } catch (error) {
        errors++;
        console.error(`   ❌ Error artículo ID ${article.id} "${article.title?.substring(0, 30)}...":`, error.message);
      }
    }

    // Mostrar progreso cada 500 artículos
    if ((i + BATCH_SIZE) % 500 === 0 || i + BATCH_SIZE >= articles.length) {
      console.log(`   📊 Progreso: ${Math.min(i + BATCH_SIZE, articles.length)}/${articles.length}`);
    }
  }

  console.log(`   ✅ Artículos migrados: ${migrated}`);
  if (errors > 0) console.log(`   ⚠️ Errores: ${errors}`);
}

async function migrateTags(sqliteDb, mysqlConn) {
  console.log('\n📦 Migrando tags...');

  const tags = await sqliteAll(sqliteDb, 'SELECT * FROM tags');
  console.log(`   Encontrados: ${tags.length} tags`);

  for (const tag of tags) {
    try {
      await mysqlConn.execute(
        `INSERT INTO tags (id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)`,
        [tag.id, tag.name]
      );
    } catch (error) {
      console.error(`   ❌ Error con tag ${tag.name}:`, error.message);
    }
  }
  console.log(`   ✅ Tags migrados`);
}

async function migrateArticleTags(sqliteDb, mysqlConn) {
  console.log('\n📦 Migrando relaciones artículo-tag...');

  const articleTags = await sqliteAll(sqliteDb, 'SELECT * FROM article_tags');
  console.log(`   Encontradas: ${articleTags.length} relaciones`);

  let migrated = 0;
  for (const at of articleTags) {
    try {
      await mysqlConn.execute(
        `INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)`,
        [at.article_id, at.tag_id]
      );
      migrated++;
    } catch (error) {
      // Ignorar duplicados
    }
  }
  console.log(`   ✅ Relaciones migradas: ${migrated}`);
}

async function migrateComments(sqliteDb, mysqlConn) {
  console.log('\n📦 Migrando comentarios...');

  const comments = await sqliteAll(sqliteDb, 'SELECT * FROM comments');
  console.log(`   Encontrados: ${comments.length} comentarios`);

  for (const comment of comments) {
    try {
      await mysqlConn.execute(
        `INSERT INTO comments (id, article_id, user_id, content, approved, created_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE content=VALUES(content), approved=VALUES(approved)`,
        [comment.id, comment.article_id, comment.user_id, comment.content, comment.approved ? 1 : 0, comment.created_at]
      );
    } catch (error) {
      console.error(`   ❌ Error comentario ID ${comment.id}:`, error.message);
    }
  }
  console.log(`   ✅ Comentarios migrados`);
}

async function migrateNewsletter(sqliteDb, mysqlConn) {
  console.log('\n📦 Migrando suscriptores newsletter...');

  const subscribers = await sqliteAll(sqliteDb, 'SELECT * FROM newsletter');
  console.log(`   Encontrados: ${subscribers.length} suscriptores`);

  for (const sub of subscribers) {
    try {
      await mysqlConn.execute(
        `INSERT INTO newsletter (id, email, active, created_at)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE active=VALUES(active)`,
        [sub.id, sub.email, sub.active ? 1 : 0, sub.created_at]
      );
    } catch (error) {
      console.error(`   ❌ Error suscriptor ${sub.email}:`, error.message);
    }
  }
  console.log(`   ✅ Suscriptores migrados`);
}

async function main() {
  console.log('🚀 MIGRACIÓN SQLite → MySQL');
  console.log('═'.repeat(50));
  console.log(`📁 SQLite: ${SQLITE_PATH}`);
  console.log(`🌐 MySQL: ${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT}`);
  console.log('═'.repeat(50));

  let sqliteDb, mysqlConn;

  try {
    sqliteDb = await getSQLiteDatabase();
    mysqlConn = await getMySQLConnection();

    // Migrar todas las tablas
    await migrateUsers(sqliteDb, mysqlConn);
    await migrateArticles(sqliteDb, mysqlConn);
    await migrateTags(sqliteDb, mysqlConn);
    await migrateArticleTags(sqliteDb, mysqlConn);
    await migrateComments(sqliteDb, mysqlConn);
    await migrateNewsletter(sqliteDb, mysqlConn);

    console.log('\n' + '═'.repeat(50));
    console.log('🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!');
    console.log('═'.repeat(50));

    // Verificar conteo final
    const [articlesCount] = await mysqlConn.execute('SELECT COUNT(*) as count FROM articles');
    const [usersCount] = await mysqlConn.execute('SELECT COUNT(*) as count FROM users');
    console.log(`\n📊 Verificación en MySQL:`);
    console.log(`   - Artículos: ${articlesCount[0].count}`);
    console.log(`   - Usuarios: ${usersCount[0].count}`);

  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error);
  } finally {
    if (sqliteDb) sqliteDb.close();
    if (mysqlConn) await mysqlConn.end();
    process.exit(0);
  }
}

main();
