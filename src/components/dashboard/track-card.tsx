import React from "react";
import Link from "next/link";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Instructor from "../icons/instructor";
import { Track } from "@/lib/api";
import Calendar from "../icons/calendar";
import { Star } from "lucide-react";

// Predefined color combinations for course badges
const courseColors = [
  { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
  { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
  { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
  { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
  { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-200" },
  { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200" },
  { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
  { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
  { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-200" },
  { bg: "bg-cyan-100", text: "text-cyan-800", border: "border-cyan-200" },
];

// Function to get consistent color for a course based on its name
const getCourseColor = (courseName: string, index: number) => {
  const hash = courseName
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = (hash + index) % courseColors.length;
  return courseColors[colorIndex];
};

interface TrackCardProps {
  track: Track;
  minimal?: boolean;
  variant?: "admin" | "public" | "minimal";
}

export default function Trackcard({
  track,
  minimal = false,
  variant = "admin",
}: TrackCardProps) {
  const truncatedDescription =
    track.description.length > 80
      ? track.description.substring(0, 80) + "..."
      : track.description;

  return (
    <Card
      className={`rounded-[20px] shadow-sm overflow-hidden px-0 pt-0 flex flex-col ${
        minimal
          ? "h-[350px]"
          : variant === "public"
          ? "h-[400px] rounded-none pb-0"
          : "h-[420px]"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Image and Price */}
        <div
          style={{ backgroundImage: `url(${track.picture})` }}
          className="bg-cover bg-center h-[180px] rounded-t-md relative flex-shrink-0"
        >
          {variant !== "public" && (<Badge className="absolute right-4 top-4 bg-white px-2.5 font-figtree font-semibold text-[14px] text-black">
            {track.price ? `$${track.price}` : "Free"}
          </Badge>)}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-between gap-3 px-4 py-4 flex-grow">
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold line-clamp-2">{track.name}</h3>

            {!minimal && (
              <div className="h-[45px] flex items-start">
                <p className="text-[16px] leading-[24px] font-inter text-muted-foreground line-clamp-2">
                  {truncatedDescription}
                </p>
              </div>
            )}

            {variant !== "public" && (
              <div className="flex items-center text-sm gap-1.5">
                <Calendar />
                <p className="text-sm text-muted-foreground">
                  {track.duration} weeks
                </p>
              </div>
            )}

            {!minimal || variant !== "public" && (
              <div className="flex items-center text-sm gap-1.5">
                <Instructor />
                <p className="text-sm text-muted-foreground">
                  {track.instructor}
                </p>
              </div>
            )}
          </div>

          {/* Courses or Rating/Price for Public */}
          {(
            <>
              {variant === "public" ? (
                <div className="min-h-[32px] flex items-center justify-between">
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= (track.rating || 0)
                            ? "text-[#d89614] fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">
                      ({track.rating || 0})
                    </span>
                  </div>
                  {/* Price */}
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary">
                      {track.price === 0 ? "Free" : `$${track.price}`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="min-h-[32px] flex flex-wrap gap-2">
                  {track.courses && track.courses.length > 0 ? (
                    <>
                      {track.courses.slice(0, 2).map((course, index) => {
                        const colorScheme = getCourseColor(course, index);
                        return (
                          <Badge
                            key={index}
                            className={`${colorScheme.bg} ${colorScheme.text} ${colorScheme.border} border font-medium text-[12px] px-3 py-1 rounded-full`}
                            variant="outline"
                          >
                            {course}
                          </Badge>
                        );
                      })}
                      {track.courses.length > 2 && (
                        <Badge
                          variant="outline"
                          className="bg-gray-50 text-gray-600 border-gray-200 text-xs px-2 py-1"
                        >
                          +{track.courses.length - 2} more
                        </Badge>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No courses yet
                    </span>
                  )}
                </div>
              )}
            </>
          )}

        </div>
        
        {/* Preview Button for Public Variant - Full Width */}
        {variant === "public" && (
          <Link href={`/tracks/${track.slug || track.id}`} className="mt-auto -m-0">
            <Button
              size="sm"
              className="cursor-pointer w-full flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors rounded-none rounded-t-none h-12"
            >
              Preview Track
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
