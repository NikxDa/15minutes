/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node/globals" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MAPBOX_API_KEY: string;
    }
  }
}
