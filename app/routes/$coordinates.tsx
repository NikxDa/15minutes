import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import "../styles/sidebar/sidebar.css";
import classNames from "classnames";
import Topic from "~/components/sidebar/Topic";
import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import mapboxgl from "mapbox-gl";
import * as martinez from "martinez-polygon-clipping";
import { text } from "node:stream/consumers";
import FilterBar from "~/components/filterbar/FilterBar";
import { useEffect, useState } from "react";
import { useMap } from "~/context/MapContext";

const CATEGORIES = ["supermarket", "doctor", "school"];
export const COLOR_CATEGORIES = {
  supermarket: "#A8DAB5",
  doctor: "#FDE295",
  school: "#0080ff",
};

const getCategoryLocator = async (coordinates: String, category: String) => {
  const result = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${category}.json?limit=9&bbox=${coordinates}&access_token=${process.env.MAPBOX_API_KEY}`
  );
  return await result.json();
};

const getIsochroneForCoord = async (coordinates: Number[]) => {
  const result = await fetch(
    `https://api.mapbox.com/isochrone/v1/mapbox/walking/${encodeURIComponent(
      coordinates.join(",")
    )}?contours_minutes=15&polygons=true&denoise=1&generalize=100&access_token=${
      process.env.MAPBOX_API_KEY
    }`
  );
  return await result.json();
};

const getPolygonsForCategory = (category: String, places: any) => {
  return Promise.all(
    places.map(async (place: { center: Number[] }) => {
      const isochrone = await getIsochroneForCoord(place.center);
      return isochrone;
    })
  );
};

const mergePolygons = (polygons: any) => {
  return polygons.reduce((acc, curPolygon) => {
    return martinez.union(acc, curPolygon.coordinates);
  }, polygons[0].coordinates);
};

export const loader = async ({ params }: LoaderArgs) => {
  const { coordinates } = params;

  const placesData = await CATEGORIES.reduce(async (res, category) => {
    const places = await getCategoryLocator(coordinates || "", category);

    const polygons = (
      await getPolygonsForCategory(category, places.features)
    ).map((polygon) => {
      return polygon.features[0].geometry;
    });

    return {
      ...(await res),
      [category]: {
        places: places.features,
        polygon: { type: "MultiPolygon", coordinates: mergePolygons(polygons) },
      },
    };
  }, {});

  return { data: placesData };
};

export default () => {
  const [showSidebar, setShowSidebar] = useState(true);

  const toggleSidebar = () => setShowSidebar((prev) => !prev);
  const { data } = useLoaderData<typeof loader>();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const map = useMap();

  const [dataAsObject, setDataAsObject] = useState(
    JSON.parse(JSON.stringify(data))
  );

  useEffect(() => {
    if (data !== undefined) setDataAsObject(JSON.parse(JSON.stringify(data)));
  }, []);
  const dataKeys = ["doctor", "school", "supermarket"];

  const formattedData = dataKeys.map((key: any) => {
    return {
      title: key,
      data: dataAsObject[key].places.map((placeObject: any) => {
        return {
          title: placeObject.text,
          address: placeObject.properties.address,
          center: placeObject.center,
        };
      }),
    };
  });

  useEffect(() => {
    if (!map) return;

    map.on("load", () => {
      Object.entries(data).forEach(([category, categoryData]) => {
        console.log("addply");
        map.addSource(category, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: categoryData.polygon,
          },
        });
        // Add a new layer to visualize the polygon.
        map.addLayer({
          id: category,
          type: "fill",
          source: category, // reference the data source
          layout: {},
          paint: {
            "fill-color": COLOR_CATEGORIES[category],
            "fill-opacity": 0.5,
          },
        });

        categoryData.places.forEach((place) => {
          new mapboxgl.Marker({ color: COLOR_CATEGORIES[category] })
            .setLngLat(place.geometry.coordinates)
            .addTo(map);
        });
      });
    });
  }, [map, data, selectedCategories]);

  const handleSelectCategory = (e) => {
    console.log("eee", e.target.value);
    const category = e.target.value;
    if (selectedCategories.includes(category)) {
      setSelectedCategories(
        selectedCategories.filter(
          (selectedCategory) => selectedCategory !== category
        )
      );
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const renderButtonBar = () => (
    <div>
      {CATEGORIES.map((category) => (
        <button
          className={`toggle-button`}
          key={category}
          value={category}
          onClick={handleSelectCategory}
        >
          {category}
        </button>
      ))}
    </div>
  );

  return (
    <>
    <div className="flex flex-row h-full">
      <div className={"map lg:basis-9/12 basis-4/12" }>
        <Link to="/">  
          <img src={require('../images/Logo.png')} className="w-20" />
        </Link>
      </div>

      <div className={classNames("lg:basis-3/12 basis-8/12 h-full max-h-full overflow-auto ", showSidebar && "bg-white shadow-lg shadow-black-500/50")}>


            <div className={classNames(!showSidebar && "float-right border-2 border-neutral-500/30 bg-white/30 rounded-md", "p-5 sticky top-0 bg-white z-10")}>
            <button
              onClick={(e : any) => toggleSidebar()}
              >
                {
                  showSidebar
                    ?
                      <ChevronDoubleRightIcon className="h-6 w-6 opcity-60"/>
                    :
                      <ChevronDoubleLeftIcon className="h-6 w-6"/>
                }
            </button>
            </div>

            {
              showSidebar &&
                <div className="contextWrapper p-5">
                  {
                    formattedData.map((topicData : any) => {
                      return(
                        <Topic title={topicData.title} key={topicData.title}
                        content={
                          topicData.data.map((content : any) => {return content})
                        } />
                      )
                    })
                  }
                </div>
            }
            </div>
        </div>

        <FilterBar showSidebar={showSidebar}/>
        </>
  );
};
