import { useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import * as martinez from "martinez-polygon-clipping";

const CATEGORIES = ["supermarket", "doctor", "school"];

const getCategoryLocator = async (coordinates: String, category: String) => {
  const result = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${category}.json?limit=9&bbox=${coordinates}&access_token=${process.env.MAPBOX_API_KEY}`
  );
  return await result.json();
};

const getIsochroneForCoord = async (coordinates: Number[]) => {
  const result = await fetch(
    `https://api.mapbox.com/isochrone/v1/mapbox/cycling/${encodeURIComponent(
      coordinates.join(",")
    )}?contours_minutes=15&polygons=true&denoise=1&access_token=${
      process.env.MAPBOX_API_KEY
    }`
  );
  return await result.json();
};

const getPolygonsForCategory = (category: String, places: any) => {
  return Promise.all(
    places.map(async (place: { center: Number[] }) => {
      const isochrone = await getIsochroneForCoord(place.center);
      // console.log("isocrone", isochrone);
      return isochrone;
    })
  );
};

const mergePolygons = (polygons: any) => {
  return polygons.reduce(
    (acc, curPolygon = []) => {
      return martinez.union(acc, curPolygon);
    },
    [[[]]]
  );
};

export const loader = async ({ params }: LoaderArgs) => {
  const { coordinates } = params;
  const placesData = await CATEGORIES.reduce(async (res, category) => {
    const places = await getCategoryLocator(coordinates || "", category);

    const polygons = (
      await getPolygonsForCategory(category, places.features)
    ).map((polygon) => {
      return polygon.features[0].geometry.coordinates[0];
    });

    return {
      ...(await res),
      [category]: {
        places: places.features,
        polygon: mergePolygons(polygons),
      },
    };
  }, {});

  return { data: placesData };
};

export default () => {
  const { data } = useLoaderData<typeof loader>();

  console.log(data);
  return JSON.stringify(data, null, 2);
};
