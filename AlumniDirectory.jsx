/*
import React, { useState, useEffect } from 'react';
import { Search, Briefcase, MapPin, Mail, ExternalLink } from 'lucide-react';
import { alumniAPI } from '../../services/api';
import { Avatar } from '../Common/Avatar';

export const AlumniDirectory = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', branch: '', graduationYear: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchAlumni = async () => {
      setLoading(true);
      try {
        const response = await alumniAPI.getAlumni({ ...filters, page, limit: 12 });
        setAlumni(response.data.alumni);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error('Failed to fetch alumni:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, [filters, page]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setPage(1);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear - i);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Alumni Directory</h1>

      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-dark-700 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Name or company..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Branch
            </label>
            <input
              type="text"
              name="branch"
              value={filters.branch}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Graduation Year
            </label>
            <select
              name="graduationYear"
              value={filters.graduationYear}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
        </div>
      ) : alumni.length === 0 ? (
        <div className="bg-white dark:bg-dark-800 rounded-lg p-12 text-center border border-gray-200 dark:border-dark-700">
          <p className="text-gray-600 dark:text-gray-400">No alumni found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {alumni.map((alum) => (
              <div
                key={alum._id}
                className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
                  <Avatar
                    name={`${alum.firstName} ${alum.lastName}`}
                    src={alum.profilePicture}
                    size="md"
                    className="border-4 border-white mb-4"
                  />
                  <h3 className="font-semibold text-lg">
                    {alum.firstName} {alum.lastName}
                  </h3>
                  <p className="text-primary-100 text-sm">Class of {alum.graduationYear}</p>
                </div>
                <div className="p-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <Briefcase className="text-gray-500 flex-shrink-0 mt-1" size={18} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {alum.currentRole}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {alum.currentCompany}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 mb-4">
                    <MapPin className="text-gray-500 flex-shrink-0 mt-1" size={18} />
                    <p className="text-sm text-gray-600 dark:text-gray-400">{alum.branch}</p>
                  </div>
                  {alum.advice && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                        Advice
                      </p>
                      <p className="text-xs text-blue-800 dark:text-blue-300 line-clamp-3">
                        {alum.advice}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-200 dark:border-dark-700">
                    <a
                      href={`mailto:${alum.email}`}
                      className="flex-1 flex items-center justify-center space-x-2 text-primary-600 font-medium text-sm"
                    >
                      <Mail size={16} />
                      <span>Email</span>
                    </a>
                    {alum.linkedinProfile && (
                      <a
                        href={alum.linkedinProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {pagination.pages}
              </span>
              <button
                type="button"
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

*/

import React, { useState, useEffect } from 'react';
import { Search, Briefcase, MapPin, Linkedin, Sparkles } from 'lucide-react';
import { alumniAPI, recommendationAPI } from '../../services/api';
import { Avatar } from '../Common/Avatar';

// Extract "in/username" from a LinkedIn URL
const getLinkedinUsername = (url) => {
  if (!url) return null;
  const match = url.match(/linkedin\.com\/(in\/[^/?#]+)/i);
  if (match) return match[1];
  // Fallback: strip protocol & domain
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
};

export const AlumniDirectory = () => {
  const [alumni, setAlumni] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', branch: '', graduationYear: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [scrollTarget, setScrollTarget] = useState(null);

  // Fetch directory
  useEffect(() => {
    const fetchAlumni = async () => {
      setLoading(true);
      try {
        const response = await alumniAPI.getAlumni({ ...filters, page, limit: 12 });
        setAlumni(response.data.alumni);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error('Failed to fetch alumni:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, [filters, page]);

  // Fetch personalized suggestions once
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await recommendationAPI.get();
        setSuggested(res.data.alumni || []);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
        setSuggested([]);
      }
    };
    fetchSuggestions();
  }, []);

  // After alumni list updates, scroll to pending target if any
  useEffect(() => {
    if (!scrollTarget) return;
    const el = document.getElementById(`alumni-card-${scrollTarget}`);
    if (!el) return;

    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-violet-500', 'ring-offset-2', 'dark:ring-offset-dark-900');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-violet-500', 'ring-offset-2', 'dark:ring-offset-dark-900');
      }, 2500);
    }, 200);

    setScrollTarget(null);
  }, [alumni, scrollTarget]);

  const handleSuggestionClick = (suggestion) => {
    const id = suggestion.sourceId;
    const existing = document.getElementById(`alumni-card-${id}`);

    if (existing) {
      // Already on the current page — scroll immediately
      existing.scrollIntoView({ behavior: 'smooth', block: 'center' });
      existing.classList.add('ring-2', 'ring-violet-500', 'ring-offset-2', 'dark:ring-offset-dark-900');
      setTimeout(() => {
        existing.classList.remove('ring-2', 'ring-violet-500', 'ring-offset-2', 'dark:ring-offset-dark-900');
      }, 2500);
      return;
    }

    // Not on current page — filter by name and queue a scroll after render
    setFilters({ search: suggestion.title, branch: '', graduationYear: '' });
    setPage(1);
    setScrollTarget(id);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setPage(1);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear - i);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Alumni Directory</h1>

      {/* ---------- SUGGESTED MENTORS ---------- */}
      {suggested.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-sm">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Suggested Mentors for You
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ranked by semantic match with your profile · Click to view in directory
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {suggested.map((s) => {
              const matchPct = Math.round((s.score || 0) * 100);
              return (
                <button
                  type="button"
                  key={s._id}
                  onClick={() => handleSuggestionClick(s)}
                  className="text-left bg-white dark:bg-dark-800 rounded-xl border border-violet-200/60 dark:border-violet-800/40 p-4 hover:border-violet-400 dark:hover:border-violet-600 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                      {s.title?.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {s.title}
                      </p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate mt-0.5">
                        {s.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-dark-700">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                      {matchPct}% match
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-500">
                      {s.meta?.branch} · {s.meta?.graduationYear}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------- FILTERS ---------- */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-dark-700 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Name or company..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Branch
            </label>
            <input
              type="text"
              name="branch"
              value={filters.branch}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Graduation Year
            </label>
            <select
              name="graduationYear"
              value={filters.graduationYear}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ---------- DIRECTORY ---------- */}
      {loading ? (
        <div className="flex justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
        </div>
      ) : alumni.length === 0 ? (
        <div className="bg-white dark:bg-dark-800 rounded-lg p-12 text-center border border-gray-200 dark:border-dark-700">
          <p className="text-gray-600 dark:text-gray-400">No alumni found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {alumni.map((alum) => {
              const username = getLinkedinUsername(alum.linkedinProfile);
              return (
                <div
                  key={alum._id}
                  id={`alumni-card-${alum._id}`}
                  className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden transition-all"
                >
                  <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
                    <Avatar
                      name={`${alum.firstName} ${alum.lastName}`}
                      src={alum.profilePicture}
                      size="md"
                      className="border-4 border-white mb-4"
                    />
                    <h3 className="font-semibold text-lg">
                      {alum.firstName} {alum.lastName}
                    </h3>
                    <p className="text-primary-100 text-sm">Class of {alum.graduationYear}</p>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <Briefcase className="text-gray-500 flex-shrink-0 mt-1" size={18} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {alum.currentRole}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {alum.currentCompany}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 mb-4">
                      <MapPin className="text-gray-500 flex-shrink-0 mt-1" size={18} />
                      <p className="text-sm text-gray-600 dark:text-gray-400">{alum.branch}</p>
                    </div>
                    {alum.advice && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4 border border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                          Advice
                        </p>
                        <p className="text-xs text-blue-800 dark:text-blue-300 line-clamp-3">
                          {alum.advice}
                        </p>
                      </div>
                    )}

                    {/* LinkedIn username as subtle text link */}
                    {username ? (
                      <a
                        href={alum.linkedinProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 w-full py-2.5 border-t border-gray-200 dark:border-dark-700 text-xs text-gray-500 dark:text-gray-400 hover:text-[#0A66C2] dark:hover:text-[#0A66C2] transition-colors"
                        title="Open LinkedIn profile"
                      >
                        <Linkedin size={14} />
                        <span className="font-medium">{username}</span>
                      </a>
                    ) : (
                      <p className="text-xs text-center text-gray-400 dark:text-gray-500 pt-2.5 border-t border-gray-200 dark:border-dark-700">
                        No contact information
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {pagination.pages}
              </span>
              <button
                type="button"
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};