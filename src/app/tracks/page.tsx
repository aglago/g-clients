'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tracksApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import TrackCard from '@/components/dashboard/track-card';
import LearnerHeader from '@/components/learner/learner-header';
import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import LearnerFooter from '@/components/learner/learner-footer';


export default function LearnerTracksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterByPrice, setFilterByPrice] = useState('all');

  const { data: tracks, isLoading, error } = useQuery({
    queryKey: ['tracks'],
    queryFn: tracksApi.getAllTracks,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Filter and sort tracks
  const filteredAndSortedTracks = tracks ? tracks
    .filter(track => {
      const matchesSearch = track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          track.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          track.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPrice = filterByPrice === 'all' || 
                          (filterByPrice === 'free' && track.price === 0) ||
                          (filterByPrice === 'paid' && track.price > 0);
      
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'duration':
          return a.duration - b.duration;
        default:
          return 0;
      }
    }) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <LearnerHeader currentPage="tracks" />
      
      {/* Hero Section */}
      <section className="bg-primary py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Tracks
          </h1>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tracks, instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-4">
              <Select value={filterByPrice} onValueChange={setFilterByPrice}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Tracks Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-80 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Failed to load tracks. Please try again later.</p>
            </div>
          ) : filteredAndSortedTracks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No tracks found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {filteredAndSortedTracks.length} Track{filteredAndSortedTracks.length !== 1 ? 's' : ''} Available
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredAndSortedTracks.map((track) => (
                  <div key={track.id} className="group hover:shadow-lg transition-shadow duration-300">
                    <TrackCard track={track} variant="public" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <LearnerFooter />
    </div>
  );
}