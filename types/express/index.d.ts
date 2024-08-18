import DiscogsClient from 'disconnect/lib/client.js';

// to make the file a module and avoid the TypeScript error
export {}

declare global {
  namespace Express {
    export interface Request {
      discogs: DiscogsClient,
      env: NodeJS.ProcessEnv
    }
  }
}