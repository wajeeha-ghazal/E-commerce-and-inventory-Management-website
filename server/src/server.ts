import { app } from './app';
import { config } from './config/env';
import { sequelize } from './config/database';

const startServer = async () => {
  try {
    console.log('Verifying database connection...');
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    const server = app.listen(config.port, () => {
      console.log(`Server listening on port ${config.port} in ${config.nodeEnv} mode`);
    });

    const shutdown = async () => {
      console.log('Shutting down server gracefully...');
      server.close(async () => {
        await sequelize.close();
        console.log('Database connection closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

export { startServer };
