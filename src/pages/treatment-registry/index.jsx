import React, { useState, useEffect, useMemo } from 'react';
import Header     from "../../components/ui/Header";
import Breadcrumb from "../../components/ui/Breadcrumb";
import supabase   from "../../utils/supabase";

import CreatePatient    from './components/CreatePatient';
import Icon             from "../../components/AppIcon";
import FilterPanel      from '../cat-registry-list/components/FilterPanel'; 
import Button           from '../../components/ui/Button'; 
import Pagination       from '../cat-registry-list/components/Pagination';
import { useNavigate }  from 'react-router-dom'; 

import { mapRecordToForm, defaultFormData } from '../cat-registration-form/utils/formMapper';
import { Search, Plus, Stethoscope, Dog, Cat, Rabbit, AlertTriangle, Eye, Edit } from 'lucide-react';

const TreatmentRegistry = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // const breadcrumbItems = [
  //   { label: 'Табло', path: '/dashboard-overview' },
  //   { label: 'Лечение', path: '/treatment' },
  // ];

  const [filters, setFilters] = useState({
    search: '',
    species: '',
    hasComplications: '',
    status: 'treatment' // По подразбиране търсим тези за лечение
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ search: '', species: '', hasComplications: '', status: 'treatment' });
    setCurrentPage(1);
  };

  // ФЕТЧВАНЕ НА ДАННИ ОТ SUPABASE
  useEffect(() => {
    const fetchTreatmentRecords = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('td_records')
          .select(`
            *,
            owner:owner_id (
              name,
              phone
            ),
            td_protocols (id, data)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const onlyWithProtocols = data.filter(record => 
          record.status === 'treatment' || (record.td_protocols && record.td_protocols.length > 0)
        );

        const mappedData = onlyWithProtocols.map(record => {
          const formMapped = mapRecordToForm(record);

          // 1. Взимаме всички протоколи
          const allProtocols = record.td_protocols || [];

          // 2. Вадим диагнозите от всеки протокол, махаме празните и повтарящите се
          const uniqueDiagnoses = [
            ...new Set(
              allProtocols
                .map(p => p.data?.diagnosis)
                .filter(d => d && d.trim() !== "")
            )
          ];
          
          const lastProtocol = allProtocols[allProtocols.length - 1]?.data;

          return {
            ...formMapped,
            latestAnamnesis: lastProtocol?.anamnesis || "Няма вписана анамнеза",
            latestTreatment: lastProtocol?.treatment || "Няма вписано лечение",
            diagnoses: uniqueDiagnoses.length > 0 
              ? uniqueDiagnoses.join(", ") 
              : "-"
          };
        });
        
        setRecords(mappedData);
      } catch (err) {
        console.error("Грешка при зареждане на лечение:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTreatmentRecords();
  }, []);

  // Логика за запис на нов пациент директно в DB
  const handleAddNewPatient = async (newRecordFromDB) => {
    // не записваме тук, защото CreatePatient го прави. 
    // Тук само обновяваме списъка в React:
    const mappedRecord = {
      ...mapRecordToForm(newRecordFromDB),
      latestAnamnesis: "Няма вписана анамнеза",
      latestTreatment: "Няма вписано лечение",
      diagnoses: "-"
    };
    
    setRecords(prev => [mappedRecord, ...prev]);
    setIsModalOpen(false);
  };

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = 
        record.recordName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        record.ownerName?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesSpecies = filters.species ? record.species === filters.species : true;
      const matchesComps = filters.hasComplications ? record.hasComplications === filters.hasComplications : true;
      
      return matchesSearch && matchesSpecies && matchesComps;
    });
  }, [records, filters]);

  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        {/* <Breadcrumb items={breadcrumbItems} /> */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl mb-2 font-bold flex items-center gap-3">
              Регистър Лечение
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Активни медицински картони: {filteredRecords.length}
            </p>
          </div>

          <Button
            variant="default"
            iconName="Plus"
            onClick={() => setIsModalOpen(true)}
          >
            Нов пациент
          </Button>
        </div>

        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          speciesOptions={[
            { label: 'Котка', value: 'cat' },
            { label: 'Куче', value: 'dog' }
          ]}
        />

        <div className="mt-8 bg-card rounded-lg shadow-warm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Пациент</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Вид</th>
                  <th className="hidden md:table-cell px-4 py-3 text-left font-semibold text-sm">Собственик</th>
                  {/* <th className="px-4 py-3 text-left font-semibold text-sm text-center">Усложнения</th> */}
                  <th className="hidden lg:table-cell px-4 py-3 text-left font-semibold text-sm">Последна анамнеза</th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left font-semibold text-sm">Заболявания</th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left font-semibold text-sm">Лечение</th>
                  <th className="px-4 py-3 text-right font-semibold text-sm">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedRecords.map((record) => (
                  <tr 
                    key={record.id} 
                    className="hover:bg-muted/50 transition-smooth cursor-pointer"
                    onClick={() => navigate(`/cat-profile-details/${record.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icon 
                          name={record.gender === 'male' ? 'Mars' : 'Venus'} 
                          size={16} 
                          className={record.gender === 'male' ? 'text-primary' : 'text-secondary'} 
                        />
                        <span className="font-medium">{record.recordName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm capitalize text-muted-foreground">{record.species}</span>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-muted-foreground">
                      {record.ownerName || "—"}
                    </td>
                    {/* <td className="px-4 py-3 text-center">
                      {record.hasComplications === 'Y' ? (
                        <div className="flex justify-center text-destructive">
                          <AlertTriangle size={20} />
                        </div>
                      ) : <span className="text-muted-foreground/20">—</span>}
                    </td> */}
                    <td className="hidden lg:table-cell px-4 py-3">
                      <span className="text-xs text-muted-foreground break-words italic">
                        {record.latestAnamnesis || "Няма записи"}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3">
                      <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-md break-words border border-amber-100">
                        {record.diagnoses}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3">
                      <span className="text-xs text-muted-foreground break-words italic">
                        {record.latestTreatment || "Няма записи"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" iconName="Eye" 
                        onClick={() => {
                          console.log("Кликнато ID:", record.id); // Провери конзолата!
                          if (record.id) navigate(`/cat-profile-details/${record.id}`);
                          else alert("Грешка: Липсва ID на записа!");
                        }}
                        />
                        <Button variant="ghost" size="icon" iconName="Edit" onClick={() => console.log('Edit', record.id)} /> 
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredRecords.length === 0 && (
          <div className="bg-card rounded-lg p-12 text-center shadow-sm border mt-4">
            <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Няма открити болни животни</h3>
            <p className="text-muted-foreground mb-6">Променете филтрите или добавете нов медицински картон.</p>
          </div>
        )}

        <CreatePatient 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleAddNewPatient} 
        />

        {filteredRecords.length > 0 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={Math.ceil(filteredRecords.length / pageSize)}
              pageSize={pageSize}
              totalItems={filteredRecords.length}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1); // Връщаме на първа страница при смяна на размера
              }}
            />
          )}
      </main>
    </div>
  );
};

export default TreatmentRegistry;