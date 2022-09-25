import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import * as turf from "@turf/turf";
import { useEffect } from "react";
import { inspect } from "util";
import { useMap } from "~/context/MapContext";
const CATEGORIES = ["supermarket", "doctor", "school"];

type Coordinate = [number, number];

type Feature = {
  center: Coordinate;
  geometry: Geometry;
};

type Geometry =
  | {
      type: "Point";
      coordinates: Coordinate;
    }
  | {
      type: "Polygon";
      coordinates: Coordinate[][];
    };

type IsochroneType = "cycling";

const getPlacesInsideArea = async (
  boundingBox: String,
  category: String
): Promise<Feature[]> => {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${category}.json?limit=10&bbox=${boundingBox}&proximity=ip&access_token=${process.env.MAPBOX_API_KEY}`;
  console.log(url);
  const result = await fetch(url);
  const data = await result.json();
  console.log(data);
  return data.features as Feature[];
};

const getIsochroneForCoordinate = async (
  coordinate: Coordinate,
  isochroneType: IsochroneType = "cycling"
): Promise<Feature[]> => {
  const result = await fetch(
    `https://api.mapbox.com/isochrone/v1/mapbox/${isochroneType}/${encodeURIComponent(
      coordinate.join(",")
    )}?contours_minutes=15&polygons=true&denoise=1&generalize=200&access_token=${
      process.env.MAPBOX_API_KEY
    }`
  );

  const data = await result.json();
  return data.features as Feature[];
};

const getPolygonsForCategoryInArea = async (
  category: string,
  boundingBox: string
): Promise<Geometry[]> => {
  const placesForCategory = await getPlacesInsideArea(boundingBox, category);
  const allFeatures: Feature[] = [];

  for (const place of placesForCategory) {
    const isochrone = await getIsochroneForCoordinate(place.center);
    allFeatures.push(...isochrone);
  }

  const geometries = allFeatures.map((feature) => feature.geometry);
  return geometries;
};

export const loader = async ({ params }: LoaderArgs) => {
  const { coordinates } = params;
  const placesData = await CATEGORIES.reduce(async (acc, category) => {
    const geometries = await getPolygonsForCategoryInArea(
      category,
      coordinates as string
    );

    console.log(inspect(geometries, false, 10, true));

    return {
      ...acc,
      [category]: {
        geometries: geometries,
      },
    };
  }, {});

  return { data: placesData };
};

export default () => {
  const { data } = useLoaderData<typeof loader>();

  const map = useMap();

  console.log(data);

  useEffect(() => {
    if (!map) return;

    console.log("loaded");

    setTimeout(() => {
      console.log("loaded 2");

      const multiPolygon = {
        type: "MultiPolygon",
        coordinates: (data as any).school.geometries.map(
          (geometry: Geometry) => geometry.coordinates
        ),
      };
      console.log("loaded 3");

      const polygons = (data as any).school.geometries as any[];
      console.log("loaded 4");

      let unionedPolygon = polygons[0];
      for (let i = 1; i < polygons.length; i++) {
        const newPolygon = turf.union(unionedPolygon, polygons[i]);
        if (newPolygon !== null) unionedPolygon = newPolygon.geometry;
      }
      console.log("loaded 5");

      try {
        map.removeLayer("maine");
        map.removeLayer("outline");
        map.removeSource("maine");
      } catch (err) {}

      map.addSource("maine", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: unionedPolygon,
        },
      });
      console.log("loaded 6");

      // Add a new layer to visualize the polygon.
      map.addLayer({
        id: "maine",
        type: "fill",
        source: "maine", // reference the data source
        layout: {},
        paint: {
          "fill-color": "#0080ff", // blue color fill
          "fill-opacity": 0.5,
        },
      });
      console.log("loaded 7");
      // Add a black outline around the polygon.
      map.addLayer({
        id: "outline",
        type: "line",
        source: "maine",
        layout: {},
        paint: {
          "line-color": "#000",
          "line-width": 1,
        },
      });

      console.log("done", map.getSource("maine"));
    }, 1500);
  });

  return (
    <div className="flex justify-end">
      <Link
        to="/"
        className="rounded-md bg-white px-4 py-2 shadow-lg disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        Back
      </Link>
    </div>
  );
};
