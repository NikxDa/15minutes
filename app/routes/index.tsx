import { useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useMap } from "~/context/MapContext";

export default function Index() {
  const map = useMap();
  const [canAnalyze, setCanAnalyze] = useState(false);

  useEffect(() => {
    if (!map) return;

    map.on("zoom", () => {
      const canZoom = map.getZoom() > 10;
      setCanAnalyze(canZoom);
    });
  }, [map]);

  const getCoordinates = () => {
    if (!map) return [];

    const canvas = map.getCanvas();
    const minX = map.unproject([0, 0]).lng;
    const maxX = map.unproject([canvas.width, 0]).lng;
    const minY = map.unproject([0, canvas.height]).lat;
    const maxY = map.unproject([canvas.width, 0]).lat;

    return [minX, minY, maxX, maxY];
  };

  const getCoordinatesUrl = () => getCoordinates().join(",");
  // encodeURIComponent(getCoordinates().join(","));

  const navigateTo = useNavigate();

  return (
    <div className="flex justify-end">
      <button
        onClick={() => {
          const url = getCoordinatesUrl();
          console.log(url);
          navigateTo(url);
        }}
        className="rounded-md bg-white px-4 py-2 shadow-lg disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!canAnalyze}
      >
        Analyze
      </button>
    </div>
  );
}
