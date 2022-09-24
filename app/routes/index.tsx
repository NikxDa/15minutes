import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import mapboxgl from "mapbox-gl";
import { useEffect, useState } from "react";

export const loader = async ({}: LoaderArgs) => {
  const mapboxApiKey = process.env.MAPBOX_API_KEY;

  return {
    mapboxApiKey,
  };
};

export default function Index() {
  const { mapboxApiKey } = useLoaderData();
  const [map, setMap] = useState<mapboxgl.Map>(null!);
  const [canAnalyze, setCanAnalyze] = useState(false);

  useEffect(() => {
    mapboxgl.accessToken = mapboxApiKey;

    const map = new mapboxgl.Map({
      container: "map", // container ID
      style: "mapbox://styles/mapbox/light-v10", // style URL
      center: [-74.5, 40], // starting position [lng, lat]
      zoom: 12, // starting zoom
      projection: { name: "globe" },
    });

    map.on("style.load", () => {
      map.setFog({}); // Set the default atmosphere style
    });

    map.on("zoom", () => {
      const canZoom = map.getZoom() > 10;
      console.log(map.getZoom(), canZoom);
      setCanAnalyze(canZoom);
    });

    setMap(map);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position);
        map.setCenter([position.coords.longitude, position.coords.latitude]);
      },
      (err) => console.log(err)
    );
  }, []);

  const getCoordinates = () => {
    if (!map) return [];

    const canvas = map.getCanvas();
    // const cUL = map.unproject([0, 0]).toArray();
    const minX = map.unproject([0, 0]).lng;
    // const cUR = map.unproject([canvas.width, 0]).toArray();
    const maxX = map.unproject([canvas.width, 0]).lng;
    const minY = map.unproject([0, canvas.height]).lat;
    const maxY = map.unproject([canvas.width, 0]).lat;

    return [minX, minY, maxX, maxY];
  };

  const getCoordinatesUrl = () =>
    encodeURIComponent(getCoordinates().join(","));

  return (
    <main className="relative">
      <div id="map" className="h-screen w-screen" />
      <Link to={getCoordinatesUrl()}>
        <button
          className="absolute top-12 right-12 rounded-md bg-white px-4 py-2 shadow-lg disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canAnalyze}
        >
          Analyze
        </button>
      </Link>
    </main>
  );
}
