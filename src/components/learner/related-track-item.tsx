import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Track } from '@/lib/api';

interface RelatedTrackItemProps {
  track: Track;
}

export default function RelatedTrackItem({ track }: RelatedTrackItemProps) {
  return (
    <Link href={`/tracks/${track.slug || track.id}`}>
      <div className="max-w-2xl flex gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow duration-300 cursor-pointer group shadow-xl">
        {/* Column 1 - Image */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 relative rounded-lg overflow-hidden">
            <Image
              src={track.picture || '/images/track-placeholder.jpg'}
              alt={track.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
        
        {/* Column 2 - Title and Description */}
        <div className="flex-grow min-w-0">
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {track.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {track.description}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>{track.duration} weeks</span>
            <span>By {track.instructor}</span>
            {track.price === 0 ? (
              <span className="font-medium text-green-600">Free</span>
            ) : (
              <span className="font-medium">${track.price}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}