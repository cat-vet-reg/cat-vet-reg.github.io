import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { label: 'Табло', path: '/dashboard-overview', icon: 'LayoutDashboard' },
    { label: 'Регистрирани', path: '/cat-registry-list', icon: 'BookOpen' },
    { label: 'Карта', path: '/interactive-cat-map', icon: 'Map' },
  ];

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[1000] bg-card shadow-warm transition-smooth">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <div className="flex items-center gap-6">
            <Link 
              to="/dashboard-overview" 
              className="flex items-center gap-3 transition-smooth hover:opacity-80"
              onClick={closeMobileMenu}
            >
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="CastraMap logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <span className="text-xl font-heading font-semibold text-foreground hidden sm:block">
                CastraMap
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  className={`
                    flex items-center gap-2 px-4 h-11 rounded-md font-medium transition-smooth
                    ${isActivePath(item?.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                  aria-current={isActivePath(item?.path) ? 'page' : undefined}
                >
                  <Icon name={item?.icon} size={18} />
                  <span>{item?.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="default"
              iconName="Plus"
              iconPosition="left"
              onClick={() => window.location.href = '#/cat-registration-form'}
              className="hidden sm:flex"
            >
              Нова котка
            </Button>

            <Button
              variant="default"
              size="icon"
              iconName="Plus"
              onClick={() => window.location.href = '#/cat-registration-form'}
              className="sm:hidden"
              aria-label="Регистрирай котка"
            />

            <button
              onClick={toggleMobileMenu}
              className="lg:hidden flex items-center justify-center w-11 h-11 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-smooth"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} />
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[1100] bg-background lg:hidden"
          onClick={closeMobileMenu}
        >
          <div className="pt-20 px-4">
            <nav className="flex flex-col gap-2">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  onClick={closeMobileMenu}
                  className={`
                    flex items-center gap-3 px-4 h-12 rounded-md font-medium transition-smooth
                    ${isActivePath(item?.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                  aria-current={isActivePath(item?.path) ? 'page' : undefined}
                >
                  <Icon name={item?.icon} size={20} />
                  <span>{item?.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
      <div className="h-16" />
    </>
  );
};

export default Header;