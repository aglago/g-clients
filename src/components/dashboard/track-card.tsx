import React from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calendar } from "lucide-react";

interface TrackCardProps {
  title: string;
  weeks: string;
  courses: string[];
  imageUrl: string;
}

export default function Trackcard({
  title,
  weeks,
  courses,
  imageUrl,
}: TrackCardProps) {
  const imageU = imageUrl || "https://via.placeholder.com/150";

  return (
    <Card className="rounded-[20px] shadow-lg overflow-hidden h-80 p-0 gap-4">
      <div
        style={{ backgroundImage: `url(${imageU})` }}
        className="bg-cover bg-center h-[180px] rounded-t-md relative"
      >
        <Badge className="bg-primary text-primary-foreground">New</Badge>
      </div>
      <div className="flex flex-col gap-5 px-4">
        <div className="flex flex-col justify-between gap-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center text-sm">
            <Calendar className="inline-block mr-1 w-4 h-4 text-black" />
            <p className="text-sm text-muted-foreground">{weeks} weeks</p>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-5">
          {courses.slice(0, 2).map((course, index) => (
            <Badge key={index}>{course}</Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}
