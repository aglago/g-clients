"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Learner, Track } from "@/lib/api";
import { Badge } from "../ui/badge";

interface LearnerDetailsModalProps {
  learner: Learner | null;
  isOpen: boolean;
  onClose: () => void;
  track?: Track;
}

export default function LearnerDetailsModal({
  learner,
  isOpen,
  onClose,
  track,
}: LearnerDetailsModalProps) {
  if (!isOpen || !learner) return null;

  const formatGender = (gender: string | undefined) => {
    return gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'Not provided';
  };

  const learnerData = [
    { label: "Track", value: track ? track.name : "No enrolled track yet" },
    { label: "Contact", value: learner.contact },
    { label: "Paid", value: `$${track ? track.price : "0"}` },
    { label: "Gender", value: formatGender(learner.gender) },
    { label: "Location", value: learner.location },
    { label: "Bio", value: learner.bio },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[20px] shadow-sm overflow-hidden p-10">
        <div className="flex flex-col items-center justify-center gap-8 max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Learner Header */}
          <div className="w-full max-w-56 flex flex-col items-center justify-center gap-2.5 mb-4">
            <div className="w-56 h-56 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-6xl">
              {learner.firstName.charAt(0)}
              {learner.lastName.charAt(0)}
            </div>
            <div className="flex items-center justify-center flex-col text-center gap-1">
              <h1 className="text-2xl font-bold">
                {learner.firstName} {learner.lastName}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{learner.email}</span>
              </div>
            </div>
          </div>

          {/* Learner Information */}
          <div className="py-10 px-6 rounded-md shadow-md">
            <div className="space-y-4">
              {learnerData.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-2 items-center"
                >
                  <Badge>{item.label}</Badge>
                  <p className="p-0">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
