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

// Използваме директния импорт на supabase
import supabase from '../../utils/supabase'; 

const CatRegistryList = () => {
  const navigate = useNavigate();

  // Стейт за данните от базата
  const [catCollection, setCatCollection] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Стейтове за филтри и сортиране
  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    color: '',
    location: ''
  });

  const [sortConfig, setSortConfig] = useState({
    column: 'created_at',
    direction: 'desc'
  });

  const [selectedCats, setSelectedCats] = useState([]);

  // 1. Вземане на реалните данни
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        // Използваме твоя изглед (view) в Supabase
        const { data, error } = await supabase
          .from('td_records')
          .select('*');
        
        if (error) throw error;
        setCatCollection(data || []);
      } catch (err) {
        console.error("Грешка при зареждане:", err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // 2. Филтриране и Сортиране (върху реалните данни)
  const filteredAndSortedCats = useMemo(() => {
    let result = [...catCollection];

    // Търсене по име, име на собственик или адрес
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(cat =>
        cat.name?.toLowerCase().includes(searchLower) ||
        cat.owner_name?.toLowerCase().includes(searchLower) ||
        cat.location_address?.toLowerCase().includes(searchLower)
      );
    }

    // Филтър за пол
    if (filters.gender) {
      result = result.filter(cat => cat.gender === filters.gender);
    }

    // Филтър за цвят
    if (filters.color) {
      result = result.filter(cat => cat.color === filters.color);
    }

    // Сортиране
    result.sort((a, b) => {
      let aValue = a[sortConfig.column];
      let bValue = b[sortConfig.column];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [catCollection, filters, sortConfig]);

  // Функции за управление
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ search: '', gender: '', color: '', location: '' });
  };

  const handleSort = (column, direction) => {
    setSortConfig({ column, direction });
  };

  const handleSelectCat = (catId) => {
    setSelectedCats(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  // ВАЖНО: Навигация към страницата с детайли с реално ID
  const handleViewDetails = (catId) => {
    navigate(`/cat-profile-details/${catId}`);
  };

// В твоя index.jsx (този със списъка/таблицата)
const handleEdit = (cat) => {
  // Вече използваме "cat", който идва от параметъра
  navigate('/cat-registration-form', { state: { catData: cat, isEditing: true } });
};

  const breadcrumbItems = [
    { label: 'Табло', path: '/dashboard-overview' },
    { label: 'Регистър на котките', path: '/cat-registry-list' }
  ];

  if (isLoading) return <div className="p-10 text-center text-xl">Зареждане на регистъра...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl mb-2 font-bold text-foreground">Регистър на котките</h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Общо регистрирани: {catCollection.length} котки
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
        />

        <div className="mt-8">
          <RegistryTable
            cats={filteredAndSortedCats} // Подаваме филтрираните данни
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
            <h3 className="text-xl font-semibold">Няма намерени котки</h3>
            <p className="text-muted-foreground mb-6">Опитайте с други критерии за търсене.</p>
            <Button variant="outline" onClick={handleClearFilters}>Изчисти филтрите</Button>
          </div>
        )}
      </main>

      <BulkActionsBar
        selectedCount={selectedCats.length}
        onClearSelection={() => setSelectedCats([])}
      />

      <FloatingActionButton
        onClick={() => navigate('/cat-registration-form')}
        label="Регистрирай нова котка"
      />
    </div>
  );
};

export default CatRegistryList;