import mapboxgl, { LngLatLike } from "mapbox-gl";
import { useMap } from "~/context/MapContext";

type ContentProps = {
    title : string;
    adress : string;
    iconType : JSX.Element;
    center : any[]
}
export default ({title, adress, iconType, center} : ContentProps) => {
    const map = useMap();

    return (
        <div className="flex flex-row items-center shadow-lg shadow-black-500/50 p-5 cursor-pointer" onClick={() => {
            if(!map) return;
            const marker = new mapboxgl.Marker({
                color: "#FFFFFF",
                draggable: false
                }).setLngLat(center as LngLatLike)
                .addTo(map);
            }}>      
            <div className="thumbnail basis-3/12">
               {iconType}
            </div>
            <div className="contentDetails flex flex-col basis-9/12">
                <div>{title}</div>
                <div>{adress}</div>
            </div>
        </div>
    )
}