import { 
    HeartIcon, 
    ShoppingBagIcon,
    AcademicCapIcon
  } from '@heroicons/react/24/solid'
import classNames from 'classnames'

type FilterBarType = {
    showSidebar : boolean;
}
export default ({ showSidebar } : FilterBarType) => {
    return (
        <div className={classNames("absolute bottom-12 w-40",

        )}>

            <div className="relative self-center flex flex-row justify-around bg-white p-5 shadow-lg shadow-black-500/50 "> 
                <HeartIcon className="h-6 w-6 opacity-60 cursor-pointer"/>
                <AcademicCapIcon className="h-6 w-6 opacity-60 cursor-pointer"/>
                <ShoppingBagIcon className="h-6 w-6 opacity-60 cursor-pointer"/>
            </div>
        </div>
    )
}