import { 
    AcademicCapIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    HeartIcon
  } from '@heroicons/react/24/solid'
import { useState } from 'react';
import Card from './Card';

type Content = {
    title : string;
    adress: string;
}
type TopicProps = {
    title : string;
    content : Content[];
}  
export default ( {title, content} : TopicProps) => {
    const [showContent, setShowContent] = useState(true);

    const iconType = (title : string) => {
        if(title === "Education")       return  <AcademicCapIcon className="h-6 w-6 opacity-60"/>
        else if(title === "Healthcare") return  <HeartIcon className="h-6 w-6 opacity-60"/>
        return  <AcademicCapIcon className="h-6 w-6 opacity-60"/>
    }
    return(
        <div>
            <div className="text-xl flex flex-row justify-between p-2"
                onClick={() => setShowContent((prev) => !prev)}
            >
                <p className="color-slate-400">{title}</p> 
                {   
                    showContent ?
                        <ChevronUpIcon className="h-6 p-1 w-6 hover:cursor-pointer"/>
                    :
                        <ChevronDownIcon className="h-6 p-1 w-6 hover:cursor-pointer" />
                }
            </div>
            {
                showContent &&
                <div >
                    {
                        content.map((data : Content) => {
                            return(
                                <div className="p-5">
                                    <Card title={data.title} adress={data.adress} iconType={iconType(title)}/>
                                </div>
                            )
                        })
                    }
                </div>
            }
        </div>
    )
}