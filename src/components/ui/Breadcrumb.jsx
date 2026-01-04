import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = ({ items }) => {
  const location = useLocation();

  const defaultItems = [
    { label: 'Dashboard', path: '/dashboard-overview' },
  ];

  const breadcrumbItems = items || defaultItems;

  return (
    <nav aria-label="Breadcrumb" className="py-4">
      <ol className="flex items-center gap-2 text-sm">
        {breadcrumbItems?.map((item, index) => {
          const isLast = index === breadcrumbItems?.length - 1;
          const isActive = location?.pathname === item?.path;

          return (
            <li key={item?.path} className="flex items-center gap-2">
              {index > 0 && (
                <Icon 
                  name="ChevronRight" 
                  size={16} 
                  className="text-muted-foreground" 
                />
              )}
              {isLast || isActive ? (
                <span 
                  className="font-medium text-foreground"
                  aria-current="page"
                >
                  {item?.label}
                </span>
              ) : (
                <Link
                  to={item?.path}
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  {item?.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;