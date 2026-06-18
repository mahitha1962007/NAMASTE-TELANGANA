import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import assignmentService from '../services/assignmentService';
import { Search, FileText, X } from 'lucide-react';
import { getRoleName } from '../utils/constants';

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [query, setQuery] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  const searchRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch assignments on search box focus to ensure fresh data without overhead on initial page load
  async function handleSearchFocus() {
    try {
      if (assignments.length === 0) {
        const res = isAdmin ? await assignmentService.getAll() : await assignmentService.getMy();
        setAssignments(res.data.data);
      }
      setShowResults(true);
    } catch (err) {
      console.error('Failed to load assignments for search', err);
    }
  }

  // Filter results dynamically as query changes
  useEffect(() => {
    if (!query.trim()) {
      setFilteredResults([]);
      return;
    }

    const filtered = assignments.filter((a) => {
      const matchTitle = a.title?.toLowerCase().includes(query.toLowerCase());
      const matchCategory = a.category?.toLowerCase().includes(query.toLowerCase());
      const matchType = a.content_type?.toLowerCase().includes(query.toLowerCase());
      return matchTitle || matchCategory || matchType;
    });
    setFilteredResults(filtered);
  }, [query, assignments]);

  function handleSelectResult(assignmentId) {
    const url = isAdmin ? `/admin/assignments/${assignmentId}` : `/staff/tasks/${assignmentId}`;
    navigate(url);
    setQuery('');
    setShowResults(false);
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="flex items-center justify-between h-16 px-6">
        
        {/* Left side — global search */}
        <div ref={searchRef} className="hidden md:block relative w-80">
          <div className="flex items-center gap-2 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200 focus-within:border-primary-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-primary-500/20 transition-all">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleSearchFocus}
              placeholder={isAdmin ? "Search assignments..." : "Search my tasks..."}
              className="bg-transparent outline-none text-sm text-gray-600 w-full placeholder:text-gray-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Search Dropdown */}
          {showResults && query.trim() && (
            <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 max-h-72 overflow-y-auto">
              <p className="text-[10px] text-gray-400 font-semibold uppercase px-4 py-1.5 border-b border-gray-50 tracking-wider">
                Matching Assignments ({filteredResults.length})
              </p>
              {filteredResults.length === 0 ? (
                <p className="text-xs text-gray-500 px-4 py-3 text-center">No assignments match your search</p>
              ) : (
                filteredResults.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleSelectResult(a.id)}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-start gap-3 transition-colors group"
                  >
                    <FileText className="w-4 h-4 text-gray-400 group-hover:text-primary-500 mt-0.5 flex-shrink-0 transition-colors" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-primary-600 transition-colors">
                        {a.title}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {a.category} • {a.content_type}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        
        <div className="md:hidden" /> {/* Spacer for mobile */}

        {/* Right side — notifications & user */}
        <div className="flex items-center gap-4">
          <NotificationDropdown />
          <div className="hidden sm:flex items-center gap-2.5 pl-4 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center border border-white shadow-sm">
              <span className="text-xs font-bold text-white">{user?.name?.charAt(0)}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-gray-400 capitalize">{getRoleName(user?.role)}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
