"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Star,
} from "lucide-react";
import { Track } from "@/lib/api";
import Instructor from "../icons/instructor";
import Trash from "../icons/trash";
import Edit from "../icons/edit";

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
  // Use both course name hash and index for more variety
  const hash = courseName
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = (hash + index) % courseColors.length;
  return courseColors[colorIndex];
};

interface TrackDetailsModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (track: Track) => void;
  onDelete?: (track: Track) => void;
}

export default function TrackDetailsModal({
  track,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: TrackDetailsModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!track) return null;

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(track);
      onClose();
    } catch (error) {
      console.error("Failed to delete track:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[20px] shadow-sm overflow-hidden px-0 pt-0 gap-4 max-w-2xl overflow-y-auto">
        <div className="space-y-4">
          {/* Image and Price */}
          <div
            style={{ backgroundImage: `url(${track.picture})` }}
            className="bg-cover bg-center h-[390px] rounded-t-md relative"
          ></div>

          {/* Details */}
          <div className="flex flex-col gap-5 px-8">
            <div className="flex flex-col justify-between gap-7">
              <h3 className="text-4xl font-semibold font-figtree">{track.name}</h3>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-sm gap-1.5">
                    <Calendar />
                    <p className="text-sm text-muted-foreground">
                      {track.duration} weeks
                    </p>
                  </div>
                  <div className="flex items-center text-sm gap-1.5">
                    <Instructor />
                    <p className="text-sm text-muted-foreground">
                      {track.instructor}
                    </p>
                  </div>
                </div>

                <Badge className="bg-white px-2.5 font-figtree font-semibold text-[24px] text-black">
                  {track.price ? `$${track.price}` : "Free"}
                </Badge>
              </div>

              <div className="flex items-center justify-between w-full">
                {/* Courses */}
                {track.courses && track.courses.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {track.courses.slice(0, 2).map((course, index) => {
                      const colorScheme = getCourseColor(course, index);
                      return (
                        <Badge
                          key={index}
                          className={`${colorScheme.bg} ${colorScheme.text} ${colorScheme.border} border font-medium text-[12px] px-5 py-2 rounded-full leading-3`}
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
                  </div>
                )}

                {/* Track Ratings */}
                {track.rating && track.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.floor(track.rating || 0)
                              ? 'text-yellow-400 fill-yellow-400'
                              : star <= (track.rating || 0)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {track.rating.toFixed(1)}/5.0
                    </span>
                    {track.reviewsCount && track.reviewsCount > 0 && (
                      <span className="text-sm text-muted-foreground">
                        ({track.reviewsCount} reviews)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <p className="text-[16px] leading-[24px] font-inter">
              {track.description}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-1 justify-end">
              <Button variant={"outline"} className="h-16 w-20 bg-[#F9FBFC] flex items-center justify-center cursor-pointer" onClick={() => onEdit?.(track)} disabled={isDeleting}>
                <Edit />
              </Button>
              <Button variant={"outline"} className="h-16 w-20 bg-[#F9FBFC] flex items-center justify-center cursor-pointer" onClick={handleDelete} disabled={isDeleting}>
                <Trash />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
