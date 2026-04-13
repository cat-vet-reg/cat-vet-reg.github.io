export const speciesOptions = [
    { value: 'cat'   , label: 'Котка' },
    { value: 'dog'   , label: 'Куче' }
]
export const genderOptions = [
    { value: "male"   , label: "Мъжки" },
    { value: "female" , label: "Женски" },
  ];

export const spicyOptions = [
  { id: "mild"        , label: "MILD"       , icon: "🟡", desc: "Спокойна"  , color: "border-yellow-400", bg: "bg-yellow-50", active: "bg-yellow-400" },
  { id: "medium"      , label: "MEDIUM"     , icon: "🟠", desc: "Любопитна" , color: "border-orange-400", bg: "bg-orange-50", active: "bg-orange-400" },
  { id: "spicy"       , label: "SPICY"      , icon: "🔴", desc: "Нервна"    , color: "border-red-500"   , bg: "bg-red-50"   , active: "bg-red-500" },
  { id: "extra_spicy" , label: "EXTRA SPICY", icon: "🌶️", desc: "Агресивна" , color: "border-red-800"   , bg: "bg-red-100"  , active: "bg-red-800" }
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
    { value: 'gray_white'   , label: 'Сиво-бяла' },
    { value: 'orange_white' , label: 'Рижо-бяла' },

    // Solid colors
    { value: 'orange'   , label: 'Рижа' },
    { value: 'black'    , label: 'Черна' },
    { value: 'gray'     , label: 'Сива' },
    { value: 'silver'   , label: 'Сребриста' },
    { value: 'white'    , label: 'Бяла' },
    { value: 'darkgray' , label: 'Сива (Синя)' },
    { value: 'brown'    , label: 'Кафява' },
    { value: 'cinnamon' , label: 'Светлокафява' },
    { value: 'fawn'     , label: 'Бежова' },
  ];

export const colorStyles = {
  tabby         : 'repeating-linear-gradient(45deg, #8B4513, #8B4513 2px, #D2B48C 2px, #D2B48C 4px)',
  tabby_white   : 'repeating-linear-gradient(45deg, #8B4513, #8B4513 2px, #D2B48C 2px, #D2B48C 4px)',
  calico        : 'conic-gradient(#FF8C42 0deg 120deg, #1A1A1A 120deg 240deg, #FFFFFF 240deg)',
  tortoiseshell : 'repeating-radial-gradient(circle, #1A1A1A, #FF8C42 5px)',
  tuxedo        : 'linear-gradient(to right, #1A1A1A 50%, #FFFFFF 50%)',
  gray_white    : 'linear-gradient(to right, #707070 50%, #FFFFFF 50%)',
  orange_white  : 'linear-gradient(to right, #FF8C42 50%, #FFFFFF 50%)',
  orange        : '#FF8C42',
  black         : '#1A1A1A',
  gray          : '#6c6c6c',
  silver        : '#bbbbbb',
  white         : '#FFFFFF',
  darkgray      : '#313131',
  brown         : '#654321',
  cinnamon      : '#8B4513',
  fawn          : '#E5AA70',
};

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
  { id: 'recorded',  label: 'Записано',       color: 'bg-slate-100 text-slate-700',         icon: 'ClipboardList' },
  { id: 'received',  label: 'Прието',         color: 'bg-indigo-100 text-indigo-700',       icon: 'LogIn' },
  { id: 'prep',      label: 'Подготовка',     color: 'bg-blue-100 text-blue-700',           icon: 'Activity' },
  { id: 'surgery',   label: 'В операция',     color: 'bg-red-500 text-white animate-pulse', icon: 'Stethoscope' },
  { id: 'recovery',  label: 'Възстановяване', color: 'bg-amber-400 text-amber-950',         icon: 'Sun' },
  { id: 'released',  label: 'Върнато',        color: 'bg-green-100 text-green-700',         icon: 'Home' },
  { id: 'missed',    label: 'Пропуснат',      color: 'bg-slate-100 text-slate-700',         icon: 'ClipboardList' },
  { id: 'treatment', label: 'За лечение',     color: 'bg-purple-100 text-purple-700',       icon: 'Thermometer' }
];

// Коригираният вариант с къдрави скоби:
export const statusDescriptions = {
  recorded: 'животното е успешно записано в нашия график и очакваме да бъде донесено в уговорения ден.',
  received: 'животното е прието в центъра и в момента се настанява и преминава първичен преглед.',
  prep: 'пациентът се подготвя за операцията. Това включва претегляне, преглед и поставяне на упойка.',
  surgery: 'в момента екипът ни извършва операцията. Моля, не се притеснявайте – Вашият любимец е в сигурни ръце.',
  recovery: 'операцията е приключила успешно. Животното в момента се събужда под активно наблюдение в топло помещение. Можете да се свържете с нас и да попитате дали животното Ви е напълно събудено.',
  released: 'пациентът вече е напълно възстановен от упойката и е предаден на своите стопани.',
  missed: 'животното не беше донесено за записания час.',
  treatment: 'животното е под наше наблюдение за провеждане на специфично лечение или допълнителни манипулации.'
};

export const complicationOptions = {
    female: [
      { id: "intra_hem"           , label: "Интраоперативна хеморагия" },
      { id: "ureter_trauma"       , label: "Ятрогенна травма на уретерите" },
      { id: "post_hem"            , label: "Постоперативна хеморагия / Хемоабдомен" },
      { id: "dehiscence"          , label: "Отваряне на раната (Dehiscence)" },
      { id: "infection_sup"       , label: "Възпалена оперативна рана, повърхностно" },
      { id: "infection_deep"      , label: "Възпалена оперативна рана, дълбоко" },
      { id: "stump_granuloma"     , label: "Синусни канали/ Грануломи на чукана (Sinus Tracts / Stump Granulomas)" },
      { id: "remnant_syndrome"    , label: "Синдром на остатъчния яйчник" },
      { id: "mammary_hyperplasia" , label: "Хиперплазия на млечните жлези" },
    ],
    male: [
      { id: "scrotal_swelling"    , label: "Подуване/контузия/хеморагия на скротума" },
      { id: "abd_hem"             , label: "Абдоминална хеморагия" },
      { id: "urethra_prostate"    , label: "Ятрогенна травма на уретрата/простатата" },
    ],
    general: [
      { id: "lung_edema"          , label: "Белодробен оток" },
      { id: "apnea"               , label: "Апнея" },
      { id: "anesthesia_reac"     , label: "Алергична реакция към упойка" },
      { id: "dead_anesthesia"     , label: "Умряло, от упойка" },
      { id: "dead_surgery"        , label: "Умряло по време на операция" },
      { id: "dead_postsurgery"    , label: "Умряло след операция" }
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
      { value: "ceh"              , label: "Кистозна хиперплазия на ендометриума" },
    ],
    male: [
      { value: "none_visible"       , label: "Нормален" },
      { value: "unilateral_crypto"  , label: "Едностранен крипторхизъм" },
      { value: "bilateral_crypto"   , label: "Двустранен крипторхизъм" },
      { value: "monorchidism"       , label: "Монорхидизъм" }
    ]
  };

export const timeOptions = [
  { value: 'all', label: 'Всички' },
  { value: '7', label: 'Последните 7 дни' },
  { value: '30', label: 'Последния месец' },
  { value: '90', label: 'Последните 3 месеца' },
];
