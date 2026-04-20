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
import * as XLSX from 'xlsx';

const CatRegistryList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const navigate = useNavigate();

  const [catCollection, setCatCollection] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClinicalView, setIsClinicalView] = useState(false);

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

  // обединява td_records и td_protocols
const displayData = useMemo(() => {
  // 1. Стандартен изглед - тук всичко е наред
  if (!isClinicalView) {
    return filteredAndSortedCats.map(cat => ({
      ...cat,
      uId: `base-${cat.id}`,
      displayDate: cat.castratedAt || cat.created_at
    }));
  }

  // 2. Амбулаторен дневник (Клиничен изглед)
  let diaryRows = [];
  
  filteredAndSortedCats.forEach(cat => {
    // СЪБИТИЕ 1: Добавяме самата кастрация (основния запис)
    diaryRows.push({
      ...cat,
      uId: `main-${cat.id}`, 
      displayDate: cat.castratedAt || cat.created_at,
      diagnosis: "Кастрация",
      treatment: "Ovariohysterectomy",
      clinicalData: cat.medical_details?.parasites || "Б.О.",
      isProtocolRow: false // Маркираме го като основен запис
    });

    // СЪБИТИЕ 2+: Добавяме всички последващи протоколи
    const protocols = cat.td_protocols || [];
    protocols.forEach(p => {
      diaryRows.push({
        ...cat,
        uId: `proto-${p.id}`, 
        displayDate: p.created_at,
        diagnosis: p.data?.diagnosis || "Преглед",
        treatment: p.data?.treatment || "Лечение",
        clinicalData: p.data?.clinical_signs || "Б.О.",
        isProtocolRow: true // Маркираме го като допълнителен протокол
      });
    });
  });

  // Сортираме хронологично всички събития
  return diaryRows.sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate));
}, [filteredAndSortedCats, isClinicalView]);

  // Изчисляваме кои котки да се покажат на текущата страница
const paginatedCats = useMemo(() => {
  const startIndex = (currentPage - 1) * pageSize;
  return displayData.slice(startIndex, startIndex + pageSize);
}, [displayData, currentPage, pageSize]);

// Важно: Нулирай страницата при смяна на режима
useEffect(() => {
  setCurrentPage(1);
}, [isClinicalView, filters]);

  // Важно: Ако филтрираме и броят на резултатите намалее, 
  // трябва да се върнем на първа страница, за да не гледаме празен екран
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // ... вътре в компонента
  const handleExport = () => {
    // Използваме displayData, защото те съдържат точно това, което е филтрирано и подредено на екрана
    const dataToExport = displayData.map(item => ({
      "Дата": new Date(item.displayDate).toLocaleDateString('bg-BG'),
      "Име на животното": item.recordName,
      "Пол": item.gender === 'female' ? 'Женски' : 'Мъжки',
      "Собственик": item.ownerName,
      "Телефон": item.ownerPhone,
      "Адрес": item.address,
      "Диагноза/Дейност": item.diagnosis,
      "Лечение/Манипулация": item.treatment,
      "Клинични данни/Бележки": item.clinicalData,
      "Хирург": item.staffSurgeon,
      "Тип запис": item.isProtocolRow ? "Последващ протокол" : "Кастрация"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registry");

    // Генериране на име на файла с днешна дата
    const fileName = `Registry_Export_${new Date().toISOString().slice(0,10)}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
  };

  if (isLoading) return <div className="p-10 text-center text-xl">Зареждане на регистъра...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        {/* <Breadcrumb items={breadcrumbItems} /> */}

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

            <Button
              variant={isClinicalView ? "default" : "outline"} // Промяна на цвета при активен режим
              iconName="FileText"
              onClick={() => setIsClinicalView(!isClinicalView)}
            >
              {isClinicalView ? "Към стандартен регистър" : "Амбулаторен дневник"}
            </Button>

            <Button 
              variant="outline" 
              iconName="Download" 
              onClick={handleExport}
            >
              Експорт към Excel
            </Button>
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
            isClinicalView={isClinicalView}
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