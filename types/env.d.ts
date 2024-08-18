// to make the file a module and avoid the TypeScript error
export {}
declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      DISCOGS_USER_TOKEN: string
      DISCOGS_USER_NAME: string
    }
  }
}