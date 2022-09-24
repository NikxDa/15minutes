import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import "mapbox-gl/dist/mapbox-gl.css";
import Map from "./components/Map";
import { MapProvider } from "./context/MapContext";
import tailwindStylesheetUrl from "./styles/tailwind.css";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    {
      rel: "stylesheet",
      href: "https://api.mapbox.com/mapbox-gl-js/v2.10.0/mapbox-gl.css",
    },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Remix Notes",
  viewport: "width=device-width,initial-scale=1",
});

export const loader = async ({}: LoaderArgs) => {
  const mapboxApiKey = process.env.MAPBOX_API_KEY as string;

  return {
    mapboxApiKey,
  };
};

export default function App() {
  const { mapboxApiKey } = useLoaderData<typeof loader>();

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <MapProvider>
          <Map className="h-screen w-screen" accessToken={mapboxApiKey} />
          <Outlet />
        </MapProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
