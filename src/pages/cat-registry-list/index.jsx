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
import { breedOptions         } from "../../constants/breed_options";
import { cityOptions    } from "../../constants/city_options";
import { mapDbToUi } from '../cat-registration-form/utils/formMapper';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const CatRegistryList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
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
        const mappedCats = (data || []).map(dbItem => {
          const uiItem = mapDbToUi(dbItem);
          // РЪЧНО закачаме идентификацията, за да не я изгубим при мапването
          uiItem.td_identifications = dbItem.td_identifications; 
          return uiItem;
        });
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
        // Скриваме 'recorded', 'missed' И всички, които нямат дата на кастрация (вкл. лечение)
        result = result.filter(cat => {
          const isRecordedOrMissed = cat.status === 'recorded' || cat.status === 'missed';
          const hasNoDate = !cat.castratedAt; // Проверява за null, undefined или празен низ

          // Показваме само ако НЕ е записан/пропуснат И има валидна дата
          return !isRecordedOrMissed && !hasNoDate;
        });
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

    // Филтри: пол, цвят, статус, лекар, локация
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

  // обединява td_records,  td_protocols, td_medical_treatments
  const displayData = useMemo(() => {
    // 1. Стандартен изглед
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

      // 1. ПОДГОТОВКА НА ДАННИТЕ ЗА ИДЕНТИФИКАЦИЯ
      const iden = cat.td_identifications && cat.td_identifications[0];
      const chipStr = iden?.chip_number ? `Чип: ${iden.chip_number}` : '';
      const passStr = iden?.passport_number ? `Пасп: ${iden.passport_number}` : '';

      // Подготвяме низа за колона "Идентификация"
      const identFields = [
        cat.medical_details?.ear_status === 'marked' ? 'V-образен разрез на дясното ухо' : '',
        cat.data?.ear_tag_number ? `Марка: ${cat.data.ear_tag_number}` : '',
        iden?.chip_number ? `Чип: ${iden.chip_number}${iden.chip_date_from ? ' (' + iden.chip_date_from + ')' : ''}` : '',
        iden?.passport_number ? `Паспорт: ${iden.passport_number}` : ''
      ];

      const idenString = identFields.filter(Boolean).join(' / ') || 'няма';

      let outcomeText = "пълно възстановяване";

      if (cat.hasComplications === 'Y' && cat.selectedComplications?.length > 0) {
        // Събираме всички възможни опции за усложнения в един списък
        const allOptions = [
          ...complicationOptions.female, 
          ...complicationOptions.male, 
          ...complicationOptions.general
        ];
        
        // Намираме етикетите за избраните ID-та
        const compLabels = cat.selectedComplications.map(compId => {
          return allOptions.find(o => o.id === compId)?.label || compId;
        });

        outcomeText = `Усложнение: ${compLabels.join(', ')}`;
      }

      // СЪБИТИЕ А: Кастрация (Основен запис)
      diaryRows.push({
        ...cat,
        uId: `main-${cat.id}`, 
        // Използваме кастрационната дата, ако я има
        displayDate: cat.castratedAt || cat.created_at,
        identificationInfo: idenString,
        td_identifications: cat.td_identifications,
        diagnosis: "Клинично здраво за кастрация",
        treatment: "Операция:" + (cat.gender === 'female' ? "Овариохистеректомия" : "Орхиектомия") + ". Лекарства: Шотапен инж. 0.5 мл ПК, Ревмокам 5 мг/мл инж. 0,1 мл ПК, Фипронил спрей 1 впръскване. Упояване с Коктейл (Медетомидин, буторфанол, Золетил) 0,11 мл." ,
        outcome: outcomeText,
        clinicalData: cat.data?.notes || "б.о.",
        isProtocolRow: false
      });

      // СЪБИТИЕ Б: Последващи протоколи (td_protocols)
      const protocols = cat.td_protocols || [];
      protocols.forEach(p => {
        const anamnesis = p.data?.anamnesis ? `Анамнеза: ${p.data.anamnesis}` : '';
        const signs = p.data?.clinical_signs ? `Симптоми: ${p.data.clinical_signs}` : '';
        const combinedClinical = [anamnesis, signs].filter(Boolean).join('; ') || "б.о.";

        diaryRows.push({
          ...cat,
          uId: `proto-${p.id}`, 
          // ВАЖНО: Сортираме по датата на протокола, а не по записването му
          displayDate: p.data?.protocol_creation_date || p.created_at,
          identificationInfo: idenString,
          td_identifications: cat.td_identifications,
          diagnosis: p.data?.diagnosis || "здраво",
          treatment: p.data?.treatment || "без лечение",
          outcome: outcomeText,
          clinicalData: combinedClinical,
          examination: p.data?.examination || "няма",
          isProtocolRow: true
        });
      });

      // СЪБИТИЕ В: Ваксинации и Обезпаразитявания (td_medical_treatments)
      // Намираме основния ред на кастрацията, който току-що добавихме
      const mainCastrationRow = diaryRows.find(r => r.uId === `main-${cat.id}`);
      const castrationDate = cat.castratedAt || cat.created_at;

      // СЪБИТИЕ В: Ваксинации и Обезпаразитявания
      const treatments = cat.td_medical_treatments || []; 

      treatments.forEach(t => {
        const treatmentDate = t.administered_at || t.created_at;
        
        // Проверяваме дали датите съвпадат (сравняваме само YYYY-MM-DD)
        const isSameDayAsCastration = 
          new Date(treatmentDate).toISOString().split('T')[0] === 
          new Date(castrationDate).toISOString().split('T')[0];

        if (isSameDayAsCastration && mainCastrationRow) {
          // АКО Е В СЪЩИЯ ДЕН: Добавяме към описанието на основния ред
          const treatText = t.type === 'vaccine' ? `Ваксинация (${t.product_name})` : `Обезпаразитяване (${t.product_name})`;
          mainCastrationRow.treatment += `; ${treatText}`;
          
          // Ако има бележки (notes) за процедурата, добавяме и тях към клиничните данни
          if (t.notes) {
            mainCastrationRow.clinicalData += `; ${t.notes}`;
          }
        } else {
          // АКО Е В РАЗЛИЧЕН ДЕН: Създаваме нов ред (както досега)
          diaryRows.push({
            ...cat,
            uId: `treat-${t.id}`,
            displayDate: treatmentDate, 
            identificationInfo: idenString,
            td_identifications: cat.td_identifications,
            diagnosis: "Клинично здраво",
            treatment: t.type === 'vaccine' ? `Ваксинация: ${t.product_name}` : `Обезпаразитяване: ${t.product_name}`,
            clinicalData: t.notes || "б.о.",
            isProtocolRow: true
          });
        }
      });

      // СЪБИТИЕ Г: Идентификация (като отделен ред в дневника)
      if (iden && (iden.chip_number || iden.passport_number)) {
        diaryRows.push({
          ...cat,
          uId: `iden-${iden.id || cat.id}`,
          // Използваме датата на чипа или паспорта за сортиране
          displayDate: iden.chip_date_from || iden.passport_date_from || cat.created_at,
          identificationInfo: idenString,
          td_identifications: cat.td_identifications,
          diagnosis: "Клинично здраво",
          treatment: [
            iden.chip_number ? `Поставяне на микрочип № ${iden.chip_number}` : '',
            iden.passport_number ? `Издаване на паспорт № ${iden.passport_number}` : ''
          ].filter(Boolean).join('; '),
          outcome: "пълно възстановяване",
          clinicalData: "Клинично здраво",
          isProtocolRow: true
        });
      }
    });

    // Финално сортиране: Всички събития (кастрации, прегледи, ваксини) 
    // подредени по реална дата (displayDate) в низходящ ред
    return diaryRows.sort((a, b) => new Date(a.displayDate) - new Date(b.displayDate));
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

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Амбулаторен дневник', {
      pageSetup: { paperSize: 9, orientation: 'landscape' } // A4 Landscape
    });

    // 1. ДЕФИНИРАНЕ НА КОЛОНИТЕ (съгласно вашите размери)
    // Размерите в exceljs са символи. Коефициентът е около 1.2 за превръщане от вашите мерки.
    worksheet.columns = [
      { header: '№', key: 'seq', width: 4 },            // 3.3
      { header: 'Амб. №', key: 'id', width: 4 },        // 3
      { header: 'Дата', key: 'date', width: 10 },       // 8
      { header: 'Собственик (име, адрес)', key: 'owner', width: 17 }, // 14
      { header: 'Пациент (вид, порода, пол, възраст)', key: 'animal', width: 12 },   // 9.5
      { header: 'Идентификация на животното', key: 'ident', width: 12 }, // 10
      { header: 'Клинични данни', key: 'clinical', width: 10 }, // 8
      { header: 'Проведени диагностични изследвания', key: 'exam', width: 13 }, // 10.7
      { header: 'Диагноза', key: 'diagnosis', width: 15 }, // 12
      { header: 'Проведено лечение', key: 'treatment', width: 17 }, // 14
      { header: 'Изход от болестта', key: 'outcome', width: 8 }, // 6.6
      { header: 'Лекар', key: 'doctor', width: 12 }      // 10
    ];

    // 2. ДОБАВЯНЕ НА ЗАГЛАВНИТЕ РЕДОВЕ (Insert at top)
    
    // Ред 1: Образецът на БАБХ (малки букви)
    worksheet.spliceRows(1, 0, ['Образец КВМП – 43/ Утвърден със заповед № РД 11-1345/14.11.2012 г. на изпълнителния директор на БАБХ']);
    worksheet.mergeCells('A1:K1');
    worksheet.getRow(1).font = { name: 'Arial', size: 6, italic: true };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    // Ред 2: Основно заглавие
    worksheet.spliceRows(2, 0, ['АМБУЛАТОРЕН ДНЕВНИК ЗА ВЕТЕРИНАРНИ КЛИНИКИ И АМБУЛАТОРИИ']);
    worksheet.mergeCells('A2:K2');
    worksheet.getRow(2).font = { name: 'Arial', size: 10, bold: true };
    worksheet.getRow(2).alignment = { horizontal: 'center' };

    // Ред 3: Име на клиниката
    worksheet.spliceRows(3, 0, ['Ветеринарна клиника: Немски кастрационен център - Пловдив']);
    worksheet.mergeCells('A3:K3');
    worksheet.getRow(3).font = { name: 'Arial', size: 9, bold: true };
    worksheet.getRow(3).alignment = { horizontal: 'center' };

    // Празен ред за разстояние (опционално)
    worksheet.spliceRows(4, 0, []);

    // 3. ПОПЪЛВАНЕ НА ДАННИТЕ
    displayData.forEach((item, index) => {
      const staffLabel = staffOptions.find(opt => opt.value === item.staffSurgeon)?.label || item.staffSurgeon;
      
      const species = item.species === 'dog' ? 'Куче' : 'Котка';
      const gender = item.gender === 'female' ? 'женски' : 'мъжки';
      const breed = breedOptions.find(opt => opt.value === item?.data?.breed)?.label || item?.data?.breed || 'Нер.';
      const age = item.data?.age_value ? `${item.data.age_value}${item.data.age_unit === 'years' ? 'год.' : 'мес.'}` : '';

      const iden = item.td_identifications && item.td_identifications[0];
      const chipStr = iden?.chip_number ? `Чип: ${iden.chip_number}` : '';
      const passStr = iden?.passport_number ? `Пасп: ${iden.passport_number}` : '';

      const row = worksheet.addRow({
        seq: index + 1,
        id: item.id,
        date: new Date(item.displayDate).toLocaleDateString('bg-BG'),
        owner: `${item.ownerName}, ${cityOptions.find(opt => opt.value === item?.location_city)?.label || item?.location_city}`,
        animal: `${species}, ${breed}, ${gender}, ${age}`,
        ident: [
          item.medical_details?.ear_status === 'marked' ? 'V-образен разрез на дясното ухо' : '',
          item.data?.ear_tag_number ? `Марка: ${item.data.ear_tag_number}` : '',
          chipStr,
          passStr
        ].filter(Boolean).join(' / ') || 'няма',
        clinical: item.clinicalData || 'б.о.',
        exam: item.examination || 'няма',
        diagnosis: item.diagnosis || 'здраво',
        outcome: item.outcome || 'пълно възстановяване',
        treatment: item.treatment || (item.gender === 'female' ? 'Овариохистеректомия' : 'Орхиектомия'),
        doctor: staffLabel
      });
    });

    // 4. ФОРМАТИРАНЕ НА ТАБЛИЦАТА (Arial 8 + Borders)
    worksheet.eachRow((row, rowNumber) => {
      // Прилагаме Arial 8 на всички редове от таблицата (след заглавията)
      if (rowNumber >= 5) {
        row.font = { name: 'Arial', size: 8 };
        row.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }

      // Всички граници (All Borders) за клетките с данни
      row.eachCell((cell) => {
        if (rowNumber >= 5) { // Започваме от хедъра на таблицата нататък
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
      });
    });

    // Стил за самия хедър на таблицата (Ред 5)
    const headerRow = worksheet.getRow(5);
    headerRow.font = { name: 'Arial', size: 8, bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

    // 5. ГЕНЕРИРАНЕ И ИЗТЕГЛЯНЕ
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Ambulatoren_dnevnik_NKC_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const handleExportChips = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Регистър чипове и паспорти');

    // 1. Дефиниране на колоните с новите изисквания
    worksheet.columns = [
      { header: 'Амб. №', key: 'id', width: 8 },
      { header: 'Собственик', key: 'owner', width: 20 },
      { header: 'ЕГН (Собственик)', key: 'egn', width: 12 },
      { header: 'Адрес (Собственик)', key: 'address', width: 25 },
      { header: 'Телефон', key: 'phone', width: 15 },
      { header: 'Име на животно', key: 'animalName', width: 15 },
      { header: 'Вид/Пол', key: 'animalType', width: 15 },
      { header: 'Рождена дата', key: 'birthDate', width: 12 },
      { header: 'Микрочип №', key: 'chip', width: 20 },
      { header: 'Дата на поставяне (чип)', key: 'chip_date', width: 12 },
      { header: 'Паспорт №', key: 'passport', width: 15 },
      { header: 'Дата на издаване (паспорт)', key: 'passport_date', width: 12 }
    ];

    // 2. Филтриране - само тези с чип или паспорт
    const catsWithIds = catCollection.filter(cat => {
      const iden = cat.td_identifications?.[0];
      return iden?.chip_number || iden?.passport_number;
    });

    catsWithIds.forEach(item => {
      const iden = item.td_identifications[0];

      // ВАЖНО: Твоят API ($apiGetCats) връща 'owner_egn' и 'owner_address'
      // Проверяваме и двата варианта (с долна черта и camelCase), за да сме сигурни
      const egn = item.owner_egn || item.ownerEgn || item.owner?.egn || item.td_owners?.egn || "—";
      const address = item.owner_address || item.ownerAddress || item.owner?.address || item.location_address || "—";

      // Взимаме данните от td_owners (ако са мапнати в обекта)
      // Обикновено при join в Supabase те идват в обект 'td_owners'
      const ownerData = item.td_owners || {};

      const species = item.species === 'dog' ? 'Куче' : 'Котка';
      const gender = item.gender === 'female' ? 'женски' : 'мъжки';

      worksheet.addRow({
        id: item.id,
        owner: item.ownerName || ownerData.name || '—',
        egn: egn, 
        address: address,
        phone: item.ownerPhone || ownerData.phone || '—',
        animalName: item.recordName || '—',
        animalType: `${species}, ${gender}`,
        birthDate: item.data?.birth_date ? new Date(item.data.birth_date).toLocaleDateString('bg-BG') : '—',
        chip: iden?.chip_number || '—',
        chip_date: iden?.chip_date_from ? new Date(iden.chip_date_from).toLocaleDateString('bg-BG') : '—',
        passport: iden?.passport_number || '—',
        passport_date: iden?.passport_date_from ? new Date(iden.passport_date_from).toLocaleDateString('bg-BG') : '—' // Дата на паспорт
      });
    });

    // 3. Стилизиране (Arial 8 за прегледност)
    worksheet.getRow(1).font = { bold: true, name: 'Arial', size: 9 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    worksheet.eachRow((row, rowNumber) => {
      row.font = { name: 'Arial', size: 8 };
      row.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      if (rowNumber > 0) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
          };
        });
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Register_Chips_Full_${new Date().toISOString().slice(0,10)}.xlsx`);
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
                  cat.status !== 'recorded' && // Статусът не е 'recorded'
                  cat.status !== 'missed'      // Изключваме и пропуснатите за всеки случай
                ).length
              } животни
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
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

              {/* НОВИЯТ БУТОН */}
              <Button 
                variant="outline" 
                iconName="CreditCard" // Може да ползвате и "Download" или друг подходящ икон от AppIcon
                onClick={handleExportChips}
              >
                Експорт на чипове
              </Button>
            </div>
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
            currentPage={currentPage}
            pageSize={pageSize}
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