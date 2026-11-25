/*
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ChatWidget } from '../Chat/ChatWidget';

export const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Header setIsOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto pt-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 min-w-[1024px]">
            {children}
          </div>
        </main>
      </div>

      {/* AI Assistant — floating on every authenticated page */   //}
//      <ChatWidget />
//    </div>
//  );
//};

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ChatWidget } from '../Chat/ChatWidget';

export const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Auto-open on desktop, close on mobile when resizing
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-col min-h-screen lg:ml-64 transition-[margin] duration-300">
        <Header setIsOpen={setSidebarOpen} />

        <main className="flex-1 pt-16">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>

      <ChatWidget />
    </div>
  );
};
