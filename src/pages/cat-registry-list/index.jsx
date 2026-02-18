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
import { $apiGetRegistryOnly } from '../../services/create_new_record';

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
    location: ''
  });

    const genderOptions = [
    { value: '', label: 'Всички полове' },
    { value: 'male', label: 'Мъжки' },
    { value: 'female', label: 'Женски' }
  ];

  const colorOptions = [
    // Patterns
    { value: 'tabby'        , label: 'Таби (тигрова)' },

    // Bi-color & multi-color
    { value: 'tabby_white'  , label: 'Таби-бяла (бяла с тигрово)' },
    { value: 'calico'       , label: 'Калико (трицветна)' },
    { value: 'tortoiseshell', label: 'Костенуркова' },
    { value: 'tuxedo'       , label: 'Черно-бяла' },
    { value: 'orange_white' , label: 'Рижо-бяла' },

    // Solid colors
    { value: 'orange'       , label: 'Рижа' },
    { value: 'black'        , label: 'Черна' },
    { value: 'white'        , label: 'Бяла' },
    { value: 'gray'         , label: 'Сива (Синя)' },
    { value: 'brown'        , label: 'Кафява' },
    { value: 'cinnamon'     , label: 'Светлокафява' },
    { value: 'fawn'         , label: 'Бежова' },
  ];

  const [sortConfig, setSortConfig] = useState({
    column    : 'castrated_at',
    direction : 'desc'
  });

  const [selectedCats, setSelectedCats] = useState([]);

  // 1. Вземане на реалните данни от Supabase
  // useEffect(() => {
  //   async function fetchData() {
  //     try {
  //       setIsLoading(true);
  //       const { data, error } = await supabase.from('td_records').select(`*, owner:owner_id (name, phone)`)
  //       .order('castrated_at', { ascending: false }) // Първо по дата
  //       .order('id', { ascending: false });
        
  //       if (error) throw error;
  //       setCatCollection(data || []);
  //     } catch (err) {
  //       console.error("Грешка при зареждане:", err.message);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }
  //   fetchData();
  // }, []);

  // 1. Вземане на данните, минаващи през филтъра за статуса "записани".
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        // Вече използваме готовата ни функция, която филтрира 'recorded'
        const { data } = await $apiGetRegistryOnly();
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

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(cat =>
        cat.name?.toLowerCase().includes(searchLower) ||
        (cat.owner?.name || cat.owner_name)?.toLowerCase().includes(searchLower) ||
        cat.location_address?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.gender) {
      result = result.filter(cat => cat.gender === filters.gender);
    }

    if (filters.color) {
      result = result.filter(cat => cat.color === filters.color);
    }
    
    result.sort((a, b) => {
    // 1. СПЕЦИАЛНО СОРТИРАНЕ ЗА УСЛОЖНЕНИЯ
      if (sortConfig.column === 'has_complications' || sortConfig.column === 'hasComplications') {
        const aValue = (a.has_complications || a.data?.has_complications || 'N').toString();
        const bValue = (b.has_complications || b.data?.has_complications || 'N').toString();
        
        // При 'desc' (низходящо) 'Y' ще бъде преди 'N' (т.е. усложненията най-отгоре)
        if (sortConfig.direction === 'desc') {
          return bValue.localeCompare(aValue);
        } else {
          return aValue.localeCompare(bValue);
        }
      }
    
      let aValue, bValue;

    if (sortConfig.column === 'owner_name') {
      aValue = a.owner?.name || a.owner_name || '';
      bValue = b.owner?.name || b.owner_name || '';
    } else if (sortConfig.column === 'owner_phone') {
      aValue = a.owner?.phone || a.owner_phone || '';
      bValue = b.owner?.phone || b.owner_phone || '';
    } else if (sortConfig.column === 'castrated_at') {
      // Вземаме времето на кастрация
      const aDate = a.castrated_at ? new Date(a.castrated_at).getTime() : 0;
      const bDate = b.castrated_at ? new Date(b.castrated_at).getTime() : 0;

      if (aDate !== bDate) {
        // Ако датите са различни, сортираме по тях
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
      } else {
        // АКО ДАТИТЕ СА ЕДНАКВИ: Винаги слагаме по-голямото ID (най-новия запис) отгоре
        const aId = Number(a.id) || 0;
        const bId = Number(b.id) || 0;
        return bId - aId; // Низходящ ред по ID за еднакви дати
      }
    } else {
      aValue = a[sortConfig.column] || '';
      bValue = b[sortConfig.column] || '';
    }

    // Сравнение за текст (Кирилица)
    if (typeof aValue === 'string') {
      const comparison = aValue.localeCompare(bValue, 'bg');
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    }

    // Сравнение за числа/дати
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return result;
}, [catCollection, filters, sortConfig]);

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
              Общо регистрирани: {catCollection.length} животни
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
          genderOptions={genderOptions} // Добави това
          colorOptions={colorOptions}   // Добави това
          // Ако имаш локации, можеш да подадеш и тях, или празен масив за сега
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