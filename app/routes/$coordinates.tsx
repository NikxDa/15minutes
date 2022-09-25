import { useLoaderData, useSearchParams } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import mapboxgl from "mapbox-gl";
import * as martinez from "martinez-polygon-clipping";
import { useEffect, useState } from "react";
import { useMap } from "~/context/MapContext";

const CATEGORIES = ["supermarket", "doctor", "school"];
const COLOR_CATEGORIES = {
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
  const { data } = useLoaderData<typeof loader>();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    map.on("load", () => {
      Object.entries(data).forEach(([category, categoryData]) => {
        // if (!selectedCategories.includes(category)) return;

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
  console.log(data);
  // return JSON.stringify(data, null, 2);
  return renderButtonBar();
};
