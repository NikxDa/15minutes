import {
  AcademicCapIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HeartIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";
import Card from "./Card";
import { COLOR_CATEGORIES } from "~/routes/$coordinates";

type Content = {
  title: string;
  address: string;
  center: any[];
};
type TopicProps = {
  title: string;
  content: Content[];
};
export default ({ title, content }: TopicProps) => {
  const [showContent, setShowContent] = useState(true);
  const [titleEdited, setTitleEdited] = useState(title);
  const iconType = (title: string) => {
    if (title === "school") {
      return (
        <AcademicCapIcon
          className="h-6 w-6 opacity-60"
          color={COLOR_CATEGORIES.school}
        />
      );
    } else if (title === "doctor") {
      return (
        <HeartIcon
          className="h-6 w-6 opacity-60"
          color={COLOR_CATEGORIES.doctor}
        />
      );
    } else if (title === "supermarket") {
      return (
        <ShoppingBagIcon
          className="h-6 w-6 opacity-60"
          color={COLOR_CATEGORIES.groceries}
        />
      );
    }
    return (
      <AcademicCapIcon
        className="h-6 w-6 opacity-60"
        color={COLOR_CATEGORIES.school}
      />
    );
  };
  const editedTitle = (title: string) => {
    if (title === "school") return "Education";
    else if (title === "supermarket") return "Groceries";
    else if (title === "doctor") return "Healthcare";
    return title;
  };
  return (
    <div>
      <div
        className="flex flex-row justify-between p-2 text-xl"
        onClick={() => setShowContent((prev) => !prev)}
      >
        <p className="color-slate-400">{editedTitle(title)}</p>
        {showContent ? (
          <ChevronUpIcon className="h-6 w-6 p-1 hover:cursor-pointer" />
        ) : (
          <ChevronDownIcon className="h-6 w-6 p-1 hover:cursor-pointer" />
        )}
      </div>
      {showContent && (
        <div>
          {content.map((data: Content) => {
            return (
              <div className="p-5">
                <Card
                  title={data.title}
                  adress={data.address}
                  iconType={iconType(title)}
                  center={data.center}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
