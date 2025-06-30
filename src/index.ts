import { createServer } from './serverLauncher';

const PORT = Number(process.env.PORT) || 3000;

createServer(PORT);
