import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Пълен списък за мобилното меню
  const allNavigationItems = [
    { label: 'График', path: '/schedule', icon: 'Calendar' },
    { label: 'Операции', path: '/today', icon: 'Activity' },
    { label: 'Регистър', path: '/cat-registry-list', icon: 'BookOpen' },
    { label: 'Лечение', path: '/treatment-registry', icon: 'Stethoscope' },
    { label: 'Карта', path: '/interactive-cat-map', icon: 'Map' },
    { label: 'Отчети', path: '/statistics', icon: 'ChartArea' },
    { label: 'Табло', path: '/dashboard-overview', icon: 'LayoutDashboard' },
    { label: 'Публичен статус', path: '/public-status', icon: 'ExternalLink' },
    { label: 'Профил', path: '/profile', icon: 'CircleUserRound' },
  ];

  // Групи за десктоп версията
  const workItems = allNavigationItems.slice(0, 3); // График, Операции, Регистър
  const secondaryItems = allNavigationItems.slice(3, 6); // Лечение, Карта, Отчети

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[1000] bg-white border-b border-slate-100 shadow-sm h-16">
        <div className="flex items-center justify-between h-full px-4 max-w-[1600px] mx-auto">
          
          {/* ЛОГО И ОСНОВНО МЕНЮ (DESKTOP) */}
          <div className="flex items-center gap-4">
            <Link to="/dashboard-overview" className="flex items-center gap-2 mr-2" onClick={closeMobileMenu}>
              <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
              <span className="text-lg font-bold text-slate-800 hidden xl:block">CastraMap</span>
            </Link>

            <nav className="hidden lg:flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100">
              {workItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    location.pathname === item.path ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* ДЕЙСТВИЯ И МОБИЛЕН БУТОН */}
          <div className="flex items-center gap-2">
            
            {/* ИКОНКИ ЗА АНАЛИЗИ (DESKTOP ONLY) */}
            <div className="hidden lg:flex items-center gap-1 mr-4 border-r pr-4 border-slate-200">
              {secondaryItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  className={`p-2.5 rounded-full transition-all ${
                    location.pathname === item.path ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                  }`}
                >
                  <Icon name={item.icon} size={20} />
                </Link>
              ))}
            </div>

            <Button
              variant="default"
              iconName="Plus"
              onClick={() => window.location.href = '#/cat-registration-form'}
              className="hidden md:flex bg-blue-600 hover:bg-blue-700 h-10 px-4 rounded-xl"
            >
              Нова регистрация
            </Button>

            {/* СИСТЕМНИ ИКОНИ (DESKTOP ONLY) */}
            <div className="hidden lg:flex items-center gap-1 ml-2">
              <Link to="/public-status" title="Публичен статус" className="p-2.5 text-slate-400 hover:text-blue-600">
                <Icon name="ExternalLink" size={20} />
              </Link>
              <Link to="/dashboard-overview" title="Табло" className="p-2.5 text-slate-400 hover:text-blue-600">
                <Icon name="LayoutDashboard" size={20} />
              </Link>
              <Link to="/profile" className="ml-2 w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center">
                <Icon name="CircleUserRound" size={22} className="text-slate-600" />
              </Link>
            </div>

            {/* БУТОН ЗА МОБИЛНО МЕНЮ (Видим само на телефон) */}
            <button 
              onClick={toggleMobileMenu} 
              className="lg:hidden p-2 w-11 h-11 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 active:bg-slate-100 transition-colors"
            >
              <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* МОБИЛНО МЕНЮ (OVERLAY) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[1100] bg-white lg:hidden animate-in fade-in slide-in-from-top duration-300">
          <div className="flex flex-col h-full">
            <div className="h-16 flex items-center justify-between px-4 border-b">
              <span className="font-bold text-slate-800">Меню</span>
              <button onClick={closeMobileMenu} className="p-2 text-slate-500"><Icon name="X" size={24} /></button>
            </div>
            
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {allNavigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-4 px-4 h-14 rounded-xl font-semibold transition-all ${
                    location.pathname === item.path ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-50'
                  }`}
                >
                  <Icon name={item.icon} size={22} />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              <div className="pt-4">
                <Button
                  variant="default"
                  iconName="Plus"
                  onClick={() => { closeMobileMenu(); window.location.href = '#/cat-registration-form'; }}
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  Нова регистрация
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}

      <div className="h-16" />
    </>
  );
};

export default Header;