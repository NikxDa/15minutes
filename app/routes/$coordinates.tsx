import { useEffect, useState } from "react";
import { 
  ChevronDoubleLeftIcon, 
  ChevronDoubleRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/solid'
import '../styles/sidebar/sidebar.css'
import classNames from "classnames";
import Topic from "~/components/sidebar/Topic";
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
  const [showSidebar, setShowSidebar] = useState(true);

  const toggleSidebar = () => setShowSidebar(prev => !prev)
  const { data } = useLoaderData<typeof loader>();

  console.log(data);
  return (
    <div className="flex flex-row h-full">
      <div className={"map lg:basis-9/12 basis-4/12" }></div>

      <div className={classNames("lg:basis-3/12 basis-8/12 h-full max-h-full overflow-auto ", showSidebar && "bg-white shadow-lg shadow-black-500/50")}>


            <div className={classNames(!showSidebar && "float-right border-2 border-neutral-500/30 bg-white/30 rounded-md", "p-5 sticky top-0 bg-white z-10")}>
            <button
              onClick={(e : any) => toggleSidebar()}
              >
                {
                  showSidebar
                    ?
                      <ChevronDoubleRightIcon className="h-6 w-6"/>
                    :
                      <ChevronDoubleLeftIcon className="h-6 w-6 "/>
                }
            </button>
            </div>

            {
              showSidebar &&
                <div className="contextWrapper p-5">
                  <Topic title="Education" content={[
                    {title: "School A", adress: "Kiefholzstr. 9, 12345 Berlin"},
                    {title: "School B", adress: "Lohmühlenstr. 12, 12345 Berlin"}
                  ]} />
                  <Topic title="Healthcare" content={[
                    {title: "Marienkrankenhaus", adress: "Kiefholzstr. 2, 12345 Berlin"},
                    {title: "Krankenhaus B", adress: "Kiefholzstr. 14, 12345 Berlin"}
                  ]}/>
                </div>
            }
            </div>
        </div>
  );
};
