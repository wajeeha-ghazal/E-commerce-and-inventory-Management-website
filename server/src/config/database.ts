import { Sequelize } from 'sequelize';
import { config } from './env';
import pg from 'pg';


let sequelize: Sequelize;

const isSupabaseOrRemote =
  config.databaseUrl.includes('supabase.co') ||
  config.databaseUrl.includes('supabase.com') ||
  config.databaseUrl.includes('sslmode=') ||
  config.isProduction;

const dialectOptions = isSupabaseOrRemote
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false , //client side verification of the server's SSL certificate is disabled
      },
    }
  : {};

if (config.databaseUrl) {
  sequelize = new Sequelize(config.databaseUrl, {
    dialect: 'postgres',
    dialectOptions,
    dialectModule: pg,
    logging: config.isProduction ? false : console.log,
  });
} else {
  sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
    host: config.db.host,
    port: config.db.port,
    dialect: 'postgres',
    dialectOptions,
    logging: config.isProduction ? false : console.log,
  });
}

export { sequelize };
export default sequelize;
