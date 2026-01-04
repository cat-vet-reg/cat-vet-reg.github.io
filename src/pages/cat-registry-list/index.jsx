import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import Button from '../../components/ui/Button';
import FilterPanel from './components/FilterPanel';
import RegistryTable from './components/RegistryTable';
import RegistryCard from './components/RegistryCard';
import BulkActionsBar from './components/BulkActionsBar';
import Pagination from './components/Pagination';
import Icon from '../../components/AppIcon';


const CatRegistryList = () => {
  const navigate = useNavigate();

  const mockCats = [
    {
      id: 1,
      name: "Whiskers",
      gender: "Male",
      color: "Orange Tabby",
      colorHex: "#FF8C42",
      weight: 4.5,
      foundLocation: "123 Main Street, Downtown District, Springfield, IL 62701",
      ownerName: "Sarah Johnson",
      ownerPhone: "+1 (555) 123-4567",
      registrationDate: "01/15/2026",
      registrationTimestamp: new Date("2026-01-15")?.getTime()
    },
    {
      id: 2,
      name: "Luna",
      gender: "Female",
      color: "Black",
      colorHex: "#1A1A1A",
      weight: 3.8,
      foundLocation: "456 Oak Avenue, Riverside Community, Portland, OR 97201",
      ownerName: "Michael Chen",
      ownerPhone: "+1 (555) 234-5678",
      registrationDate: "12/28/2025",
      registrationTimestamp: new Date("2025-12-28")?.getTime()
    },
    {
      id: 3,
      name: "Shadow",
      gender: "Male",
      color: "Gray",
      colorHex: "#808080",
      weight: 5.2,
      foundLocation: "789 Elm Street, Lakeside Neighborhood, Seattle, WA 98101",
      ownerName: "Emily Rodriguez",
      ownerPhone: "+1 (555) 345-6789",
      registrationDate: "01/02/2026",
      registrationTimestamp: new Date("2026-01-02")?.getTime()
    },
    {
      id: 4,
      name: "Mittens",
      gender: "Female",
      color: "White",
      colorHex: "#FFFFFF",
      weight: 3.2,
      foundLocation: "321 Pine Road, Hillside Area, Denver, CO 80201",
      ownerName: "David Thompson",
      ownerPhone: "+1 (555) 456-7890",
      registrationDate: "12/20/2025",
      registrationTimestamp: new Date("2025-12-20")?.getTime()
    },
    {
      id: 5,
      name: "Tiger",
      gender: "Male",
      color: "Brown Tabby",
      colorHex: "#8B4513",
      weight: 6.1,
      foundLocation: "654 Maple Drive, Sunset Valley, Austin, TX 78701",
      ownerName: "Jessica Martinez",
      ownerPhone: "+1 (555) 567-8901",
      registrationDate: "01/03/2026",
      registrationTimestamp: new Date("2026-01-03")?.getTime()
    },
    {
      id: 6,
      name: "Bella",
      gender: "Female",
      color: "Calico",
      colorHex: "#F4A460",
      weight: 4.0,
      foundLocation: "987 Cedar Lane, Garden District, New Orleans, LA 70112",
      ownerName: "Robert Wilson",
      ownerPhone: "+1 (555) 678-9012",
      registrationDate: "12/15/2025",
      registrationTimestamp: new Date("2025-12-15")?.getTime()
    },
    {
      id: 7,
      name: "Simba",
      gender: "Male",
      color: "Orange",
      colorHex: "#FFA500",
      weight: 5.5,
      foundLocation: "147 Birch Street, Mountain View, San Francisco, CA 94102",
      ownerName: "Amanda Lee",
      ownerPhone: "+1 (555) 789-0123",
      registrationDate: "01/01/2026",
      registrationTimestamp: new Date("2026-01-01")?.getTime()
    },
    {
      id: 8,
      name: "Chloe",
      gender: "Female",
      color: "Siamese",
      colorHex: "#D2B48C",
      weight: 3.5,
      foundLocation: "258 Willow Court, Parkside, Boston, MA 02101",
      ownerName: "Christopher Brown",
      ownerPhone: "+1 (555) 890-1234",
      registrationDate: "12/22/2025",
      registrationTimestamp: new Date("2025-12-22")?.getTime()
    },
    {
      id: 9,
      name: "Max",
      gender: "Male",
      color: "Tuxedo",
      colorHex: "#000000",
      weight: 4.8,
      foundLocation: "369 Spruce Avenue, Beachfront, Miami, FL 33101",
      ownerName: "Nicole Anderson",
      ownerPhone: "+1 (555) 901-2345",
      registrationDate: "12/30/2025",
      registrationTimestamp: new Date("2025-12-30")?.getTime()
    },
    {
      id: 10,
      name: "Daisy",
      gender: "Female",
      color: "Tortoiseshell",
      colorHex: "#8B4513",
      weight: 3.9,
      foundLocation: "741 Ash Boulevard, Historic Center, Philadelphia, PA 19101",
      ownerName: "James Taylor",
      ownerPhone: "+1 (555) 012-3456",
      registrationDate: "01/04/2026",
      registrationTimestamp: new Date("2026-01-04")?.getTime()
    },
    {
      id: 11,
      name: "Oliver",
      gender: "Male",
      color: "Gray Tabby",
      colorHex: "#A9A9A9",
      weight: 5.0,
      foundLocation: "852 Poplar Street, University District, Ann Arbor, MI 48101",
      ownerName: "Sophia Garcia",
      ownerPhone: "+1 (555) 123-4568",
      registrationDate: "12/18/2025",
      registrationTimestamp: new Date("2025-12-18")?.getTime()
    },
    {
      id: 12,
      name: "Lily",
      gender: "Female",
      color: "Cream",
      colorHex: "#FFFDD0",
      weight: 3.6,
      foundLocation: "963 Hickory Lane, Suburban Area, Charlotte, NC 28201",
      ownerName: "Daniel White",
      ownerPhone: "+1 (555) 234-5679",
      registrationDate: "12/25/2025",
      registrationTimestamp: new Date("2025-12-25")?.getTime()
    }
  ];

  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    color: '',
    location: ''
  });

  const [sortConfig, setSortConfig] = useState({
    column: 'registrationDate',
    direction: 'desc'
  });

  const [selectedCats, setSelectedCats] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' }
  ];

  const colorOptions = [
    { value: 'Orange Tabby', label: 'Orange Tabby' },
    { value: 'Black', label: 'Black' },
    { value: 'Gray', label: 'Gray' },
    { value: 'White', label: 'White' },
    { value: 'Brown Tabby', label: 'Brown Tabby' },
    { value: 'Calico', label: 'Calico' },
    { value: 'Orange', label: 'Orange' },
    { value: 'Siamese', label: 'Siamese' },
    { value: 'Tuxedo', label: 'Tuxedo' },
    { value: 'Tortoiseshell', label: 'Tortoiseshell' },
    { value: 'Gray Tabby', label: 'Gray Tabby' },
    { value: 'Cream', label: 'Cream' }
  ];

  const locationOptions = [
    { value: 'Springfield, IL', label: 'Springfield, IL' },
    { value: 'Portland, OR', label: 'Portland, OR' },
    { value: 'Seattle, WA', label: 'Seattle, WA' },
    { value: 'Denver, CO', label: 'Denver, CO' },
    { value: 'Austin, TX', label: 'Austin, TX' },
    { value: 'New Orleans, LA', label: 'New Orleans, LA' },
    { value: 'San Francisco, CA', label: 'San Francisco, CA' },
    { value: 'Boston, MA', label: 'Boston, MA' },
    { value: 'Miami, FL', label: 'Miami, FL' },
    { value: 'Philadelphia, PA', label: 'Philadelphia, PA' },
    { value: 'Ann Arbor, MI', label: 'Ann Arbor, MI' },
    { value: 'Charlotte, NC', label: 'Charlotte, NC' }
  ];

  const filteredAndSortedCats = useMemo(() => {
    let result = [...mockCats];

    if (filters?.search) {
      const searchLower = filters?.search?.toLowerCase();
      result = result?.filter(cat =>
        cat?.name?.toLowerCase()?.includes(searchLower) ||
        cat?.ownerName?.toLowerCase()?.includes(searchLower) ||
        cat?.foundLocation?.toLowerCase()?.includes(searchLower)
      );
    }

    if (filters?.gender) {
      result = result?.filter(cat => cat?.gender === filters?.gender);
    }

    if (filters?.color) {
      result = result?.filter(cat => cat?.color === filters?.color);
    }

    if (filters?.location) {
      result = result?.filter(cat => cat?.foundLocation?.includes(filters?.location));
    }

    result?.sort((a, b) => {
      let aValue = a?.[sortConfig?.column];
      let bValue = b?.[sortConfig?.column];

      if (sortConfig?.column === 'registrationDate') {
        aValue = a?.registrationTimestamp;
        bValue = b?.registrationTimestamp;
      }

      if (typeof aValue === 'string') {
        aValue = aValue?.toLowerCase();
        bValue = bValue?.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig?.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig?.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return result;
  }, [mockCats, filters, sortConfig]);

  const paginatedCats = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedCats?.slice(startIndex, endIndex);
  }, [filteredAndSortedCats, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedCats?.length / pageSize);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      gender: '',
      color: '',
      location: ''
    });
    setCurrentPage(1);
  };

  const handleSort = (column, direction) => {
    setSortConfig({ column, direction });
  };

  const handleSelectCat = (catId) => {
    setSelectedCats(prev =>
      prev?.includes(catId)
        ? prev?.filter(id => id !== catId)
        : [...prev, catId]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedCats(paginatedCats?.map(cat => cat?.id));
    } else {
      setSelectedCats([]);
    }
  };

  const handleViewDetails = (catId) => {
    navigate(`/cat-profile-details?id=${catId}`);
  };

  const handleEdit = (catId) => {
    navigate(`/cat-registration-form?id=${catId}`);
  };

  const handleExport = () => {
    const selectedCatsData = mockCats?.filter(cat => selectedCats?.includes(cat?.id));
    console.log('Exporting cats:', selectedCatsData);
    alert(`Exporting ${selectedCats?.length} cat(s) data...`);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedCats?.length} cat(s)?`)) {
      console.log('Deleting cats:', selectedCats);
      setSelectedCats([]);
      alert(`${selectedCats?.length} cat(s) deleted successfully`);
    }
  };

  const handleClearSelection = () => {
    setSelectedCats([]);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard-overview' },
    { label: 'Cat Registry', path: '/cat-registry-list' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl mb-2">Cat Registry</h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Browse and manage all registered cats in the system
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              iconName="Map"
              iconPosition="left"
              onClick={() => navigate('/interactive-cat-map')}
              className="hidden sm:flex"
            >
              View Map
            </Button>
            <Button
              variant="default"
              iconName="Plus"
              iconPosition="left"
              onClick={() => navigate('/cat-registration-form')}
              className="hidden sm:flex"
            >
              Register New Cat
            </Button>
          </div>
        </div>

        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          genderOptions={genderOptions}
          colorOptions={colorOptions}
          locationOptions={locationOptions}
        />

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredAndSortedCats?.length} {filteredAndSortedCats?.length === 1 ? 'result' : 'results'}
          </p>
        </div>

        <div className="hidden lg:block">
          <RegistryTable
            cats={paginatedCats}
            selectedCats={selectedCats}
            onSelectCat={handleSelectCat}
            onSelectAll={handleSelectAll}
            onSort={handleSort}
            sortConfig={sortConfig}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
          />
        </div>

        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paginatedCats?.map(cat => (
            <RegistryCard
              key={cat?.id}
              cat={cat}
              isSelected={selectedCats?.includes(cat?.id)}
              onSelect={handleSelectCat}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
            />
          ))}
        </div>

        {filteredAndSortedCats?.length === 0 && (
          <div className="bg-card rounded-lg p-8 md:p-12 text-center shadow-warm">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-muted rounded-full flex items-center justify-center">
                <Icon name="Search" size={32} className="text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-semibold mb-2">No cats found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search terms
            </p>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        )}

        {filteredAndSortedCats?.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredAndSortedCats?.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </main>
      <BulkActionsBar
        selectedCount={selectedCats?.length}
        onExport={handleExport}
        onDelete={handleDelete}
        onClearSelection={handleClearSelection}
      />
      <FloatingActionButton
        onClick={() => navigate('/cat-registration-form')}
        label="Register New Cat"
      />
    </div>
  );
};

export default CatRegistryList;