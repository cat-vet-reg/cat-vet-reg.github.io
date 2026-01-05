import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const SearchBar = ({ suggestions }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  const filteredSuggestions = suggestions?.filter(
    (suggestion) =>
      suggestion?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      suggestion?.owner?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery?.trim()) {
      navigate('/cat-registry-list', { state: { searchQuery } });
    }
  };

  const handleSuggestionClick = (catId) => {
    navigate('/cat-profile-details', { state: { catId } });
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Icon 
            name="Search" 
            size={20} 
            className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
          />
          <input
            type="text"
<<<<<<< HEAD
            placeholder="Търси по животно или собственик..."
=======
            placeholder="Search by cat name or owner..."
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e?.target?.value);
              setShowSuggestions(e?.target?.value?.length > 0);
            }}
            onFocus={() => setShowSuggestions(searchQuery?.length > 0)}
            className="w-full h-12 md:h-14 pl-10 md:pl-12 pr-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
          />
        </div>
      </form>
      {showSuggestions && filteredSuggestions?.length > 0 && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setShowSuggestions(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-warm-lg max-h-80 overflow-y-auto z-20">
            {filteredSuggestions?.slice(0, 5)?.map((suggestion) => (
              <button
                key={suggestion?.id}
                onClick={() => handleSuggestionClick(suggestion?.id)}
                className="w-full p-3 md:p-4 hover:bg-muted transition-smooth text-left border-b border-border last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Cat" size={20} color="var(--color-primary)" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{suggestion?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">Owner: {suggestion?.owner}</p>
                  </div>
                  <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchBar;