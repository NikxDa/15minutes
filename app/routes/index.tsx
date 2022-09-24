import { Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useMap } from "~/context/MapContext";

export default function Index() {
  const map = useMap();
  const [canAnalyze, setCanAnalyze] = useState(false);

  useEffect(() => {
    if (!map) return;

    map.on("zoom", () => {
      const canZoom = map.getZoom() > 10;
      console.log(map.getZoom(), canZoom);
      setCanAnalyze(canZoom);
    });
  }, [map]);

  const getCoordinates = () => {
    if (!map) return;

    const canvas = map.getCanvas();
    const cUL = map.unproject([0, 0]).toArray();
    const cUR = map.unproject([canvas.width, 0]).toArray();
    const cLR = map.unproject([canvas.width, canvas.height]).toArray();
    const cLL = map.unproject([0, canvas.height]).toArray();

    const coordinates = [cUL, cUR, cLR, cLL, cUL];
    return coordinates;
  };

  const getCoordinatesUrl = () => {
    const coordinates = getCoordinates();
    return coordinates?.join(":");
  };

  return (
    <main className="relative">
      <Link
        to={`/analyze/${getCoordinatesUrl()}`}
        className="absolute top-12 right-12"
        type="submit"
      >
        <button
          className="rounded-md bg-white px-4 py-2 shadow-lg disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canAnalyze}
        >
          Analyze
        </button>
      </Link>
    </main>
  );
}
