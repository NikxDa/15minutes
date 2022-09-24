import { useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";

const CATEGORIES = ["supermarket", "doctor", "school"];

const getPlacesForCoord = (coordinates: String) => async (category: String) => {
  const result = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${category}.json?limit=9&bbox=${coordinates}&access_token=${process.env.MAPBOX_API_KEY}`
  );
  return await result.json();
};

export const loader = async ({ params }: LoaderArgs) => {
  const { coordinates } = params;
  const getPlacesForCategory = getPlacesForCoord(coordinates || "");

  const data = await CATEGORIES.reduce(async (res, category) => {
    const response = await getPlacesForCategory(category);
    return { ...(await res), [category]: response.features };
  }, {});

  return { data };
};

export default () => {
  const { data } = useLoaderData<typeof loader>();

  console.log(data);
  return JSON.stringify(data, null, 2);
};
