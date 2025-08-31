'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogIn, ChevronDown, Home, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface LearnerHeaderProps {
  currentPage?: 'home' | 'tracks';
}

export default function LearnerHeader({ currentPage = 'home' }: LearnerHeaderProps) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Determine dropdown options based on current page
  const getDropdownOptions = () => {
    if (pathname === '/portal') {
      // On portal page: Home and Logout
      return [
        { label: 'Home', icon: Home, onClick: () => router.push('/') },
        { label: 'Logout', icon: LogOut, onClick: handleLogout },
      ];
    } else {
      // On all other pages: Portal and Logout
      return [
        { label: 'Portal', icon: User, onClick: () => router.push('/portal') },
        { label: 'Logout', icon: LogOut, onClick: handleLogout },
      ];
    }
  };

  return (
    <header className="bg-white">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link href="/">
                <Image
                  src="/images/azubi-logo.svg"
                  alt="G-Clients"
                  width={85}
                  height={24}
                  className="h-6 w-24"
                />
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link 
                  href="/" 
                  className={`px-3 py-2 text-[16px] font-medium ${
                    currentPage === 'home' 
                      ? 'text-primary' 
                      : 'text-gray-500 hover:text-primary'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  href="/tracks" 
                  className={`px-3 py-2 text-[16px] font-medium ${
                    currentPage === 'tracks' 
                      ? 'text-primary' 
                      : 'text-gray-500 hover:text-primary'
                  }`}
                >
                  Tracks
                </Link>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 px-3 py-2"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    {user.profileImage ? (
                      <Image
                        src={user.profileImage}
                        alt={`${user.firstName} ${user.lastName}`}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-primary">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">
                    {user.firstName} {user.lastName}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                    {getDropdownOptions().map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.label}
                          onClick={() => {
                            option.onClick();
                            setIsDropdownOpen(false);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors"
                        >
                          <Icon className="w-4 h-4" />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="text-sm font-semibold font-inter px-6 py-3">
                    Login <LogIn className='ml-1' />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="text-sm bg-primary hover:bg-primary/90 font-semibold font-inter px-6 py-3">
                    Sign Up <LogIn className='ml-1' />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}