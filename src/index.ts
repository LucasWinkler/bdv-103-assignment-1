import { createServer } from './server';

const PORT = Number(process.env.PORT) || 3000;

createServer(PORT);
