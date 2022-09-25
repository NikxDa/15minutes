import classNames from "classnames";
import mapboxgl from "mapbox-gl";
import { useContext, useEffect } from "react";
import MapContext from "~/context/MapContext";

type MapProps = {
  className?: string;
  accessToken: string;
};

const Map = ({ className, accessToken }: MapProps) => {
  const mapContext = useContext(MapContext);

  useEffect(() => {
    if (mapContext.map) return;

    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/light-v10",
      center: [13, 52],
      zoom: 12,
      projection: { name: "globe" },
    });

    map.on("style.load", () => {
      map.setFog({}); // Set the default atmosphere style
    });

    mapContext.setMap(map);
    (window as any).map = map;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        map.setCenter([position.coords.longitude, position.coords.latitude]);
      },
      (err) => console.log(err)
    );
  }, []);

  return <div className={classNames(className)} id="map" />;
};

export default Map;
