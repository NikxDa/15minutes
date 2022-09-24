import { 
    AcademicCapIcon,
    HeartIcon
  } from '@heroicons/react/24/solid'
type ContentProps = {
    title : string;
    adress : string;
    iconType : JSX.Element
}
export default ({title, adress, iconType} : ContentProps) => {
    return (
        <div className="flex flex-row items-center shadow-lg shadow-black-500/50 p-5">
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