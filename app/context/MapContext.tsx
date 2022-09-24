import mapboxgl from "mapbox-gl";
import { createContext, ReactNode, useContext, useState } from "react";

type MapContextType = {
  map?: mapboxgl.Map;
  setMap: (map: mapboxgl.Map) => void;
};

const MapContext = createContext<MapContextType>({
  map: undefined,
  setMap: () => {},
});

export const MapProvider = ({ children }: { children: ReactNode }) => {
  const [map, setMap] = useState<mapboxgl.Map>();

  return (
    <MapContext.Provider value={{ map, setMap }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  return context.map;
};

export default MapContext;
