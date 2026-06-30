import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  // Reconnexion automatique si Redis redémarre
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('connect', () => {
  console.log('✅ Redis connecté');
});

redis.on('error', (err) => {
  console.error('❌ Erreur Redis:', err.message);
});

export default redis;