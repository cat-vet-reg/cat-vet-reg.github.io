import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import Button from '../../components/ui/Button';
import FilterPanel from './components/FilterPanel';
import RegistryTable from './components/RegistryTable';
import BulkActionsBar from './components/BulkActionsBar';
import Icon from '../../components/AppIcon';
import supabase from '../../utils/supabase'; 
import Pagination from './components/Pagination';
import { $apiGetCats } from '../../services/create_new_record';
import {  bcsScores,
          getBcsDescription,
          ageUnitOptions, 
          colorOptions,
          colorStyles,
          habitat,
          origin,
          generalConditionOptions, 
          statusOptions, 
          complicationOptions,
          staffOptions,
          earStatusOptions,
          parasiteOptions,
          discoverySourceOptions,
          reproductiveOptions
          } from "../../constants/formOptions";
import { mapDbToUi } from '../cat-registration-form/utils/formMapper';

const CatRegistryList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const navigate = useNavigate();

  const [catCollection, setCatCollection] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    color: '',
    species: '',
    status: '',
    staffSurgeon: '',
    location: '',
    showRecorded: false
  });

    const genderOptions = [
    { value: '', label: 'Всички полове' },
    { value: 'male', label: 'Мъжки' },
    { value: 'female', label: 'Женски' }
  ];

  const [sortConfig, setSortConfig] = useState({
    column    : 'castrated_at',
    direction : 'desc'
  });

  const [selectedCats, setSelectedCats] = useState([]);

  // 1. Вземане на данните
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const { data } = await $apiGetCats();
        // ТУК ПРИЛАГАМЕ formMapper
        const mappedCats = (data || []).map(mapDbToUi);
        setCatCollection(mappedCats);
      } catch (err) {
        console.error("Грешка:", err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // 2. Филтриране и Сортиране (върху реалните данни)
  const filteredAndSortedCats = useMemo(() => {
    let result = [...catCollection];

    // Филтър за записани и липсващи
    if (!filters.showRecorded) {
      result = result.filter(cat => cat.status !== 'recorded' && cat.status !== 'missed');
    }

    // Търсене (изключително чисто вече!)
    const searchLower = filters.search.toLowerCase();
    if (searchLower) {
      result = result.filter(cat => 
        cat.recordName.toLowerCase().includes(searchLower) ||
        cat.ownerName.toLowerCase().includes(searchLower) ||
        cat.ownerPhone.toLowerCase().includes(searchLower) ||
        cat.address.toLowerCase().includes(searchLower)
      );
    }

    // Филтри: пол, цвят, статус, локация
    if (filters.gender) result = result.filter(cat => cat.gender === filters.gender);
    if (filters.color) result = result.filter(cat => cat.data?.color === filters.color);
    if (filters.species) result = result.filter(cat => cat.species === filters.species);
    if (filters.status)  result = result.filter(cat => cat.status === filters.status);
    if (filters.staffSurgeon) result = result.filter(cat => cat.staffSurgeon === filters.staffSurgeon);
    if (filters.location) {
      const locLower = filters.location.toLowerCase();
      result = result.filter(cat => cat.address?.toLowerCase().includes(locLower));
    }

    // Сортиране
    result.sort((a, b) => {
      const col = sortConfig.column;
      const dir = sortConfig.direction === 'asc' ? 1 : -1;

      // Специално за дати
      if (col === 'castrated_at') {
        const dateA = new Date(a.castratedAt || 0).getTime();
        const dateB = new Date(b.castratedAt || 0).getTime();
        return (dateA - dateB) * dir;
      }

      // За текст (Кирилица)
      const valA = String(a[col] || '').toLowerCase();
      const valB = String(b[col] || '').toLowerCase();
      return valA.localeCompare(valB, 'bg') * dir;
    });

    return result;
  }, [catCollection, filters, sortConfig]);

  // ОБНОВЕНО: Изчистване на всички филтри
  const handleClearFilters = () => {
    setFilters({ 
      search: '', 
      gender: '', 
      color: '', 
      species: '', 
      status: '', 
      location: '', 
      showRecorded: false 
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (column, direction) => {
    setSortConfig({ column, direction });
  };

  const handleSelectCat = (catId) => {
    setSelectedCats(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleViewDetails = (catId) => {
    navigate(`/cat-profile-details/${catId}`);
  };

  const handleEdit = (cat) => {
    navigate('/cat-registration-form', { state: { catData: cat, isEditing: true } });
  };

  const breadcrumbItems = [
    { label: 'Табло'                , path: '/dashboard-overview' },
    { label: 'Регистър на животните', path: '/cat-registry-list' }
  ];

  // Изчисляваме кои котки да се покажат на текущата страница
  const paginatedCats = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedCats.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedCats, currentPage, pageSize]);

  // Важно: Ако филтрираме и броят на резултатите намалее, 
  // трябва да се върнем на първа страница, за да не гледаме празен екран
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  if (isLoading) return <div className="p-10 text-center text-xl">Зареждане на регистъра...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl mb-2 font-bold text-foreground">Регистър на животните</h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Общо регистрирани: {
                catCollection.filter(cat => 
                  cat.castrated_at && // Има записана дата на кастрация
                  cat.data?.status !== 'recorded' && // Статусът в 'data' не е 'recorded'
                  cat.data?.status !== 'missed'      // Изключваме и пропуснатите за всеки случай
                ).length
              } животни
            </p>
          </div>

          <Button
            variant="default"
            iconName="Plus"
            iconPosition="left"
            onClick={() => navigate('/cat-registration-form')}
          >
            Нова регистрация
          </Button>
        </div>

        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          genderOptions={genderOptions} 
          colorOptions={colorOptions}   
          staffOptions={staffOptions}   
          locationOptions={[]}          
        />

        <div className="mt-8">
          <RegistryTable
            cats={paginatedCats}
            selectedCats={selectedCats}
            onSelectCat={handleSelectCat}
            onSort={handleSort}
            sortConfig={sortConfig}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
          />
        </div>

        {filteredAndSortedCats.length === 0 && (
          <div className="bg-card rounded-lg p-12 text-center shadow-sm border mt-4">
            <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Няма намерени животни</h3>
            <p className="text-muted-foreground mb-6">Опитайте с други критерии за търсене.</p>
            <Button variant="outline" onClick={handleClearFilters}>Изчисти филтрите</Button>
          </div>
        )}

          {filteredAndSortedCats.length > 0 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAndSortedCats.length / pageSize)}
              pageSize={pageSize}
              totalItems={filteredAndSortedCats.length}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1); // Връщаме на първа страница при смяна на размера
              }}
            />
          )}
      </main>

      <BulkActionsBar
        selectedCount={selectedCats.length}
        onClearSelection={() => setSelectedCats([])}
      />

      <FloatingActionButton
        onClick={() => navigate('/cat-registration-form')}
        label="Регистрирай ново животно"
      />

    </div>
  );
};

export default CatRegistryList;