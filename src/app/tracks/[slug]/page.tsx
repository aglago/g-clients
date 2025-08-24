"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { tracksApi, coursesApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  Clock,
  User,
  Star,
  ArrowLeft,
  Users,
  GraduationCap,
  Calendar,
} from "lucide-react";
import LearnerHeader from "@/components/learner/learner-header";
import RelatedTrackItem from "@/components/learner/related-track-item";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function TrackDetailPage() {
  const params = useParams();
  const trackSlug = params.slug as string;

  const { data: track, isLoading: trackLoading } = useQuery({
    queryKey: ["tracks", "slug", trackSlug],
    queryFn: () => tracksApi.getTrackBySlug(trackSlug),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: allCourses } = useQuery({
    queryKey: ["courses"],
    queryFn: coursesApi.getAllCourses,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: allTracks } = useQuery({
    queryKey: ["tracks"],
    queryFn: tracksApi.getAllTracks,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Get courses for this track
  const trackCourses =
    allCourses?.filter((course) => course.track === track?.id) || [];

  // Get related tracks (same instructor or similar topics)
  const relatedTracks =
    allTracks
      ?.filter(
        (t) =>
          t.id !== track?.id &&
          (t.instructor === track?.instructor ||
            t.name
              .toLowerCase()
              .includes(track?.name.toLowerCase().split(" ")[0] || ""))
      )
      .slice(0, 3) || [];

  if (trackLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LearnerHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div>
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LearnerHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Track Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The track you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link href="/tracks">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tracks
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LearnerHeader />

      {/* Hero Section */}
      <section className="bg-primary py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 relative">
            {/* Column 1 - Track Information */}
            <div className="space-y-6 text-white">
              {/* Row 1 - Breadcrumbs */}
              <Breadcrumb>
                <BreadcrumbList className="text-white/80">
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="/"
                      className="text-white/80 hover:text-white"
                    >
                      Home
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-white/60" />
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="/tracks"
                      className="text-white/80 hover:text-white"
                    >
                      Tracks
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-white/60" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-white">
                      {track.name}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              {/* Row 2 - Track Name */}
              <h1 className="text-4xl md:text-5xl font-bold">{track.name}</h1>

              {/* Row 3 - Track Description */}
              <p className="text-lg text-white/90 leading-relaxed max-w-2xl">
                {track.description}
              </p>

              {/* Row 4 - Stats (3 columns) */}
              <div className="grid grid-cols-3 gap-6 pt-4">
                {/* Instructor */}
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start text-white/80 mb-1">
                    <User className="w-4 h-4 mr-2" />
                    <span className="text-sm">Instructor</span>
                  </div>
                  <div className="font-semibold">{track.instructor}</div>
                </div>

                {/* Enrolled Students */}
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start text-white/80 mb-1">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm">Students</span>
                  </div>
                  <div className="font-semibold">
                    {track.enrolledCount || 0}
                  </div>
                </div>

                {/* Rating */}
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start text-white/80 mb-1">
                    <Star className="w-4 h-4 mr-2" />
                    <span className="text-sm">Rating</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start">
                    <span className="font-semibold mr-2">
                      {track.rating ? track.rating.toFixed(1) : "0.0"}
                    </span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            track.rating && star <= track.rating
                              ? "text-yellow-400 fill-current"
                              : "text-white/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-white/80 ml-2">
                      ({track.reviewsCount || 0})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2 - Enrollment Card (Absolutely Positioned) */}
            <div className="lg:absolute lg:right-0 lg:top-0 lg:w-96 lg:z-10">
              <Card className="sticky top-8 rounded-none py-0">
                <CardContent className="py-3 px-5">
                  <Image
                    src={track.picture || "/images/track-placeholder.jpg"}
                    alt={track.name}
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover rounded-md mb-5"
                  />

                  <div className="space-y-4 mb-6">
                    <h2 className="font-semibold text-lg">Course Details</h2>
                    <div className="flex justify-between py-4 border-b border-gray-200">
                      <span className="flex items-center text-black">
                        <Clock size={24} className="mr-2" /> Duration:
                      </span>

                      <span className="font-semibold">
                        {track.duration} weeks
                      </span>
                    </div>
                    <div className="flex justify-between py-4 border-b border-gray-200">
                      <span className="flex items-center text-black">
                        <GraduationCap size={24} className="mr-2" />
                        Courses:
                      </span>
                      <span className="font-semibold">
                        {trackCourses.length}
                      </span>
                    </div>
                    <div className="flex justify-between py-4 border-b border-gray-200">
                      <span className="flex items-center text-black">
                        <User size={24} className="mr-2" /> Instructor:
                      </span>
                      <span className="font-semibold">{track.instructor}</span>
                    </div>
                    <div className="flex justify-between py-4 border-b border-gray-200">
                      <span className="flex items-center text-black">
                        <Calendar size={24} className="mr-2" /> Date:
                      </span>
                      <span className="font-semibold">
                        {new Date(track.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short", // or 'long' for full month name
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <div className="text-xl font-bold text-gray-900 mb-2">
                      {track.price === 0 ? "Free" : `$${track.price}.00`}
                    </div>
                  </div>

                  <Link
                    href={`/checkout?track=${track.slug}`}
                    className="block mb-4"
                  >
                    <Button className="w-full" size="lg">
                      {track.price === 0 ? "Enroll for Free" : `Enroll`}
                    </Button>
                  </Link>

                  <p className="text-xs text-gray-500 text-center">
                    30-day money-back guarantee • Lifetime access • Certificate
                    of completion
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:pr-[25rem]">
        {/* What You Will Learn Section */}
        {trackCourses.length > 0 && (
          <div className="mb-16">
            <div className="rounded-lg p-6 border max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              What You Will Learn
            </h2>
              <ul className="space-y-3">
                {trackCourses.map((course) => (
                  <li key={course.id} className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-4 flex-shrink-0"></span>
                    <div>
                      <span className="font-medium text-gray-900">{course.title}</span>
                      {course.description && (
                        <span className="text-gray-600"> - {course.description}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Related Tracks */}
        {relatedTracks.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Related Tracks
            </h2>
            <div className="space-y-4">
              {relatedTracks.map((relatedTrack) => (
                <RelatedTrackItem
                  key={relatedTrack.id}
                  track={relatedTrack}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
