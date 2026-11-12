require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const dbUrl = process.env.DATABASE_URL || '';
const isSupabaseOrRemote =
  dbUrl.includes('supabase.co') ||
  dbUrl.includes('supabase.com') ||
  dbUrl.includes('sslmode=') ||
  process.env.NODE_ENV === 'production';

const dialectOptions = isSupabaseOrRemote
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }
  : {};

const dbConfig = dbUrl
  ? {
      url: dbUrl,
      dialect: 'postgres',
      dialectOptions,
    }
  : {
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || null,
      database: process.env.DB_NAME || 'ecomm_db',
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      dialect: 'postgres',
      dialectOptions,
    };

module.exports = {
  development: dbConfig,
  test: dbConfig,
  production: dbConfig,
};
