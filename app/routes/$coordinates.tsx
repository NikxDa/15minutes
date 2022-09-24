import { useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";

export const loader = async ({ params }: LoaderArgs) => {
  const { coordinates } = params;
  console.log(coordinates);

  const result = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/supermarket.json?limit=9&bbox=${coordinates}&access_token=${process.env.MAPBOX_API_KEY}`
  );
  const data = await result.json();
  return { data };
};

export default () => {
  const { data } = useLoaderData<typeof loader>();

  return JSON.stringify(data, null, 2);
};
