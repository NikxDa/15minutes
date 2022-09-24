import { useEffect, useState } from "react";
import { 
  ChevronDoubleLeftIcon, 
  ChevronDoubleRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/solid'
import '../styles/sidebar/sidebar.css'
import classNames from "classnames";
import Topic from "~/components/sidebar/Topic";

export default () => {
  const [showSidebar, setShowSidebar] = useState(true);

  const toggleSidebar = () => setShowSidebar(prev => !prev)

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