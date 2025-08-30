import { ArrowUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function LearnerFooter() {
  return (
    <footer className="mt-auto bg-primary text-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="justify-self-start">
            <Image
              src="/images/learner/landing/gclient-logo-white.svg"
              alt="G-Clients"
              width={385}
              height={110}
            />
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
          <p>
            &copy; {new Date().getFullYear()} G-Clients. All rights reserved.
          </p>
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
}
