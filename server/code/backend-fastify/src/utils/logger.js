import pino from 'pino';
import pinoPretty from 'pino-pretty';

const isDevelopment = process.env.NODE_ENV === 'development';

const baseConfig = {
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
    log: (object) => ({ 
      ...object,
      hostname: process.env.HOSTNAME || 'unknown',
      service: process.env.SERVICE_NAME || 'fastify-app',
    })
  }
};

const developmentConfig = {
  ...baseConfig,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
      ignore: 'pid,hostname,service',
    }
  }
};

const productionConfig = {
  ...baseConfig,
  redact: {
    paths: ['password', 'token', 'authorization', 'cookie'],
    censor: '[REDACTED]'
  }
}

export default pino(isDevelopment ? developmentConfig : productionConfig);

export const dbLogger = pino({
  ...baseConfig,
  nama: 'database'
}, isDevelopment ? pinoPretty() : undefined);