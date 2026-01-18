export const genderOptions = [
    { value: "male"   , label: "Мъжки" },
    { value: "female" , label: "Женски" },
  ];

export const bcsScores = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const getBcsDescription = (score) => {
  const numScore = Number(score);
  if (numScore <= 3)  return { text: "⚠️ Поднормено: Видими ребра, без мазнини."              , class: "text-yellow-700" };
  if (numScore <= 5)  return { text: "✅ Идеално: Ребрата се палпират, ясна талия."           , class: "text-green-700" };
                      return { text: "⚠️ Наднормено: Трудно палпируеми ребра, липса на талия.", class: "text-red-700" };
};
  
export const ageUnitOptions = [
    { value: "months" , label: "Месеца" },
    { value: "years"  , label: "Години" },
  ];

export const colorOptions = [
    // Patterns
    { value: "tabby", label: "Таби (тигрова)" },

    // Bi-color & multi-color
    { value: 'tabby_white'  , label: 'Таби-бяла (бяла с тигрово)' },
    { value: 'calico'       , label: 'Калико (трицветна)' },
    { value: 'tortoiseshell', label: 'Костенуркова' },
    { value: 'tuxedo'       , label: 'Черно-бяла' },
    { value: 'orange_white' , label: 'Рижо-бяла' },

    // Solid colors
    { value: 'orange'   , label: 'Рижа' },
    { value: 'black'    , label: 'Черна' },
    { value: 'white'    , label: 'Бяла' },
    { value: 'gray'     , label: 'Сива (Синя)' },
    { value: 'brown'    , label: 'Кафява' },
    { value: 'cinnamon' , label: 'Светлокафява' },
    { value: 'fawn'     , label: 'Бежова' },
  ];

export const habitat = [
    {value: 'street'  , label: "На улицата" , color: "bg-slate-100 text-slate-700 border-slate-200" },
    {value: 'outdoor' , label: "На двора"   , color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    {value: 'indoor'  , label: "В дома"     , color: "bg-blue-100 text-blue-700 border-blue-200" }
];

export const origin = [
  {value: 'bought'  , label: "Купена"},
  {value: 'street'  , label: "Улица"},
  {value: 'yard'    , label: "Двор"}
]

export const generalConditionOptions = [
  { value: "good"     , label: "Добро" },
  { value: "fair"     , label: "Средно" },
  { value: "poor"     , label: "Лошо" },
  { value: "critical" , label: "Критично" },
];

export const statusOptions = [
  { id: 'recorded'  , label: 'Записано'       , color: 'bg-slate-100 text-slate-700' },
  { id: 'received'  , label: 'Прието'         , color: 'bg-slate-100 text-slate-700' },
  { id: 'prep'      , label: 'Подготовка'     , color: 'bg-blue-100 text-blue-700' },
  { id: 'surgery'   , label: 'В операция'     , color: 'bg-red-100 text-red-700' },
  { id: 'recovery'  , label: 'Възстановяване' , color: 'bg-amber-100 text-amber-700' },
  { id: 'released'  , label: 'Върнато'        , color: 'bg-green-100 text-green-700' }
];

export const complicationOptions = {
    female: [
      { id: "intra_hem"           , label: "Интраоперативна хеморагия" },
      { id: "ureter_trauma"       , label: "Ятрогенна травма на уретерите" },
      { id: "post_hem"            , label: "Постоперативна хеморагия / Хемоабдомен" },
      { id: "dehiscence"          , label: "Отваряне на раната (Dehiscence)" },
      { id: "infection"           , label: "Инфекция на оперативната рана" },
      { id: "stump_granuloma"     , label: "Синусни канали/ Грануломи на чукана (Sinus Tracts / Stump Granulomas)" },
      { id: "remnant_syndrome"    , label: "Синдром на остатъчния яйчник" },
      { id: "mammary_hyperplasia" , label: "Хиперплазия на млечните жлези" },
      { id: "mammary_hyperplasia" , label: "Хиперплазия на млечните жлези" },
    ],
    male: [
      { id: "scrotal_swelling"    , label: "Подуване/контузия/хеморагия на скротума" },
      { id: "abd_hem"             , label: "Абдоминална хеморагия" },
      { id: "urethra_prostate"    , label: "Ятрогенна травма на уретрата/простатата" },
    ],
    general: [
      { id: "lung_edema"          , label: "Белодробен оток" },
      { id: "anesthesia_reac"     , label: "Алергична реакция към упойка" }
    ]
  };

export const staffOptions = [
    { value: "dr_taneva"        , label: "д-р Танева" },
    { value: "dr_dimitrova"     , label: "д-р Димитрова" },
    { value: "yana"             , label: "Яна Янкова" },
  ];

export const earStatusOptions = [
  { id: 'marked'  , label: 'Маркирано (V-образно)' },
  { id: 'unmarked', label: 'Немаркирано' }
];

export const parasiteOptions = [
    { id: 'fleas' , label: 'Бълхи' },
    { id: 'ticks' , label: 'Кърлежи' },
    { id: 'worms' , label: 'Глисти' },
    { id: 'none'  , label: 'Няма видими' },
  ];

export const discoverySourceOptions = [
  { value: "brochure" , label: "От брошура" },
  { value: "hunter"   , label: "От ловеца ни" },
  { value: "friends"  , label: "От познати" },
  { value: "social"   , label: "От социалните мрежи" },
  { value: "tv"       , label: "От телевизията" },
];

export const reproductiveOptions = {
    female: [
      { value: "baby"             , label: "Бебешка матка" },
      { value: "heat"             , label: "Разгонена" },
      { value: "early_pregnancy"  , label: "Начална бременност" },
      { value: "late_pregnancy"   , label: "Напреднала бременност" },
      { value: "post_pregnancy"   , label: "След бременност (кърмеща/родила)" },
      { value: "none_visible"     , label: "Няма следи от бременност" },
      { value: "mucometra"        , label: "Мукометра" },
      { value: "pyometra"         , label: "Пиометра" },
      { value: "ovarian_cyst"     , label: "Киста на яйчника" },
    ],
    male: [
      { value: "none_visible"       , label: "Нормален" },
      { value: "unilateral_crypto"  , label: "Едностранен крипторхизъм" },
      { value: "bilateral_crypto"   , label: "Двустранен крипторхизъм" },
      { value: "monorchidism"       , label: "Монорхидизъм" }
    ]
  };
