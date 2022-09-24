import { useLoaderData } from "@remix-run/react";
import { LoaderArgs } from "@remix-run/server-runtime";
import mapboxgl from "mapbox-gl";
import { useEffect } from "react";

export const loader = async ({}: LoaderArgs) => {
  const mapboxApiKey = process.env.MAPBOX_API_KEY;

  return {
    mapboxApiKey,
  };
};

export default function Index() {
  const { mapboxApiKey } = useLoaderData();

  useEffect(() => {
    mapboxgl.accessToken = mapboxApiKey;

    const map = new mapboxgl.Map({
      container: "map", // container ID
      style: "mapbox://styles/mapbox/light-v10", // style URL
      center: [-74.5, 40], // starting position [lng, lat]
      zoom: 9, // starting zoom
      projection: { name: "globe" },
    });

    map.on("style.load", () => {
      map.setFog({}); // Set the default atmosphere style
    });
  });

  return (
    <main>
      <div id="map" className="h-screen w-screen" />
    </main>
  );
}
