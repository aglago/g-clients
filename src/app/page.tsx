"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { tracksApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import TrackCard from "@/components/dashboard/track-card";
import LearnerHeader from "@/components/learner/learner-header";
import { FaGraduationCap, FaUserGraduate } from "react-icons/fa6";
import { IoTime } from "react-icons/io5";
import { ArrowUp } from "lucide-react";

const HeroSection = () => (
  <section className="relative h-[600px] md:h-[500px] 2xl:h-[65vh] flex items-center justify-start">
    <div className="absolute inset-0 bg-[url('/images/learner/landing/hero-background.jpg')] bg-cover bg-center"></div>
    <div className="absolute inset-0 herobg-surface-action-gradient"></div>
    <div className="absolute z-10 text-left text-white w-full left-0 top-1/2 transform -translate-y-1/2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl md:text-4xl font-lato font-bold mb-6 max-w-[474px]">
          Unlock Your Potential with Industry-Leading Courses!
        </h1>
        <p className="text-lg md:text-xl mb-8 opacity-90 max-w-[474px]">
          &quot;Join thousands of learners gaining real-world skills and
          advancing their careers. Our expert-led courses are designed to
          empower you to succeed.&quot;
        </p>
        <Link href="/register">
          <Button
            size="lg"
            className="w-fit text-background font-semibold px-8 !py-4 text-lg"
          >
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

const OurSolutions = () => {
  const { data: tracks, isLoading } = useQuery({
    queryKey: ["tracks"],
    queryFn: tracksApi.getAllTracks,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const displayTracks = tracks?.slice(0, 4) || [];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-[40px] font-bold text-gray-900 mb-4">
            Our Solutions
          </h2>
          <p className="text-xl text-gray-600 mx-auto">
            Choose from our comprehensive learning tracks designed by industry
            experts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))
            : displayTracks.map((track) => (
                <Link key={track.id} href={`/tracks/${track.slug}`}>
                  <div className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                    <TrackCard track={track} minimal={true} />
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
};

const NextSteps = () => {
  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const coursesApi = await import("@/lib/api").then((m) => m.coursesApi);
      return coursesApi.getAllCourses();
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const displayCourses = courses?.slice(0, 6) || [];

  // Array of vibrant border colors
  const borderColors = [
    "border border-red-500",
    "border border-blue-500",
    "border border-green-500",
    "border border-yellow-500",
    "border border-purple-500",
    "border border-pink-500",
  ];

  return (
    <section className="py-20 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Title, Description, and Courses */}
          <div className="text-background justify-self-start">
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-4">
                What Will Be Your Next Step?
              </h2>
              <p className="text-xl">
                Discover our diverse stack of solutions, including software
                development, data science, and cloud tools. Sign up today and
                kickstart your journey!
              </p>
            </div>

            {/* Course List with Multicolored Borders */}
            <div className="flex gap-4">
              {displayCourses.map((course, index) => (
                <div
                  key={course.id}
                  className={`p-4 bg-transparent w-fit rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                    borderColors[index % borderColors.length]
                  }`}
                >
                  <h4 className="font-semibold text-background text-lg">
                    {course.title}
                  </h4>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative h-full justify-self-end">
            <Image
              src="/images/learner/landing/desktop-mockup.svg"
              alt="Learning devices"
              width={345}
              height={420}
              className="rounded-lg w-80 h-[420px] object-contain"
            />
            <Image
              src="/images/learner/landing/mobile-mockup.svg"
              alt="Learning devices"
              width={100}
              height={240}
              className="absolute bottom-0 rounded-lg w-24 h-60 object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const ProudStats = () => {
  const { data: stats } = useQuery({
    queryKey: ["public-stats"],
    queryFn: async () => {
      const { publicApi } = await import("@/lib/api");
      return publicApi.getStats();
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const displayStats = [
    {
      icon: <FaGraduationCap className="text-[#4182B3]" size={84} />,
      number: stats?.coursesCount || 0,
      label: "Courses",
      suffix: "+",
    },
    {
      icon: <FaUserGraduate className="text-[#4182B3]" size={84} />,
      number: stats?.studentsCount || 0,
      label: "Students",
      suffix: "+",
    },
    {
      icon: <IoTime className="text-[#4182B3]" size={84} />,
      number: stats?.hoursOfContent || 1000,
      label: "Hours of Content",
      suffix: "+",
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-[40px] font-bold text-black mb-4">
            We Are Proud
          </h2>
          <p className="text-xl text-black">
            {" "}
            We take pride in our achievements and commitment to excellence. Join
            us in celebrating innovation, growth, and success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayStats.map((stat, index) => (
            <div
              key={index}
              className="text-center relative flex flex-col items-center"
            >
              {stat.icon}
              <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
                {stat.number}
                {stat.suffix}
              </div>
              <div className="text-xl text-black font-semibold">
                {stat.label}
              </div>
              {/* Vertical divider - only show for first 2 items on md+ screens */}
              {index < displayStats.length - 1 && (
                <div className="hidden md:block absolute right-0 top-0 h-full w-px bg-primary/40"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = () => (
  <section className="relative h-56 flex items-center justify-center">
    <div className="absolute inset-0 bg-[url('/images/learner/landing/cta-background.jpg')] bg-cover bg-center"></div>
    <div className="absolute inset-0 bg-[#01589ACC]"></div>
    <div className="relative z-10 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 md:gap-9">
          <div className="text-left text-background">
            <h3 className="text-3xl font-bold mb-4">
              It&apos;s Time to Start Investing in Yourself
            </h3>
            <p className="text-xl max-w-3xl">
              Online courses open the opportunity for learning to almost anyone,
              regardless of their scheduling commitments.
            </p>
          </div>
          <Link href="/register">
            <Button
              size="lg"
              className="border border-background font-semibold px-8 py-3 w-fit"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const ProcessSection = () => {
  const steps = [
    {
      number: "1",
      title: "Sign Up and Choose Your Course",
      description:
        "Create your account and browse through our comprehensive catalog of courses and learning tracks.",
    },
    {
      number: "2",
      title: "Onboard",
      description:
        "Complete your profile setup and get personalized course recommendations based on your goals.",
    },
    {
      number: "3",
      title: "Start Your Course",
      description:
        "Begin learning with structured lessons, interactive content, and expert guidance.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">The Process</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            {steps.map((step) => (
              <div key={step.number} className="flex items-start">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mr-6 flex-shrink-0">
                  {step.number}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h4>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative">
            <Image
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3"
              alt="Learning process"
              width={600}
              height={500}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-primary text-background py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="justify-self-start">
          <Image
            src="/images/learner/landing/gclient-logo-white.svg"
            alt="G-Clients"
            width={385}
            height={110}
          />
          {/* <p className="text-background">
            Empowering learners worldwide with quality education and
            professional development.
          </p> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 justify-self-end">
          <div>
            <h4 className="text-lg font-semibold mb-4">Menu</h4>
            <ul className="space-y-2 text-background">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/tracks" className="hover:text-white">
                  Tracks
                </Link>
              </li>
              {/* <li>
                <Link href="/courses" className="hover:text-white">
                  Courses
                </Link>
              </li> */}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-background">
              <li>
                <Link href="tel:233509581027" className="hover:text-white">
                  +233(0)509581027
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:samuellamanyeaglago@gmail.com"
                  className="hover:text-white"
                >
                  samuellamanyeaglago@gmail.com
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Social</h4>
            <ul className="space-y-2 text-background">
              <li>
                <Link
                  href="https://linkedin.com/in/samuella-aglago"
                  className="hover:text-white"
                >
                  Linkedin
                </Link>
              </li>
              <li>
                <Link
                  href="https://twitter.com/smaglago"
                  className="hover:text-white"
                >
                  X (Formerly Twitter)
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-background mt-8 pt-8 text-center text-background flex flex-col md:flex-row items-center justify-between gap-4">
        <p>&copy; {new Date().getFullYear()} G-Clients. All rights reserved.</p>
        <Link href="" className="flex gap-2">
          <p>Back to the top</p>
          <div className="border border-background">
            <ArrowUp />
          </div>
        </Link>
      </div>
    </div>
  </footer>
);

export default function LearnerHomePage() {
  return (
    <div className="min-h-screen">
      <LearnerHeader currentPage="home" />
      <HeroSection />
      <OurSolutions />
      <NextSteps />
      <ProudStats />
      <CTASection />
      <ProcessSection />
      <Footer />
    </div>
  );
}
