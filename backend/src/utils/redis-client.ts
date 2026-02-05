import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('error', (err) => {
  console.log('Redis Client Error', err);
});

export const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
    console.log('Redis Client connected');
  }
};

export default client;
