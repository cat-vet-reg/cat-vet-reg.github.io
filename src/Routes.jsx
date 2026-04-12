import React from "react";
import { HashRouter, Routes as RouterRoutes, Route, Navigate, useLocation } from "react-router-dom";
import ScrollToTop         from "components/ScrollToTop";
import ErrorBoundary       from "components/ErrorBoundary";
import NotFound            from "pages/NotFound";
import CatProfileDetails   from './pages/cat-profile-details';
import DashboardOverview   from './pages/dashboard-overview';
import CatRegistryList     from './pages/cat-registry-list';
import InteractiveCatMap   from './pages/interactive-cat-map';
import CatRegistrationForm from './pages/cat-registration-form';
import StatisticsTable     from './pages/statistics';
import Schedule            from './pages/schedule';
import TreatmentRegistry   from './pages/treatment-registry';
import Today               from './pages/today';
import Profile             from './pages/profile';
import PublicStatusPage    from './pages/public-status';

// ПОМОЩЕН КОМПОНЕНТ ЗА ЗАЩИТА
const ProtectedRoute = ({ session, children }) => {
  const location = useLocation();
  
  // Ако потребителят е на публичната страница, го пускаме веднага
  if (location.pathname === '/public-status') {
    return children;
  }

  // Ако не е логнат и се опитва да влезе другаде, му показваме Login
  if (!session) {
    return <Login />;
  }

  return children;
};

const Routes = ({ session, userRole }) => {
  return (
    <HashRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <ProtectedRoute session={session}>
          <RouterRoutes>
            <Route path="/public-status" element={<PublicStatusPage />} />
            
            {/* Всички тези ще изискват Login заради ProtectedRoute */}
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/dashboard-overview" element={<DashboardOverview />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/today" element={<Today />} />
            <Route path="/cat-registry-list" element={<CatRegistryList />} />
            <Route path="/treatment-registry" element={<TreatmentRegistry />} />
            <Route path="/interactive-cat-map" element={<InteractiveCatMap />} />
            <Route path="/statistics" element={<StatisticsTable />} />
            <Route path="/cat-registration-form" element={<CatRegistrationForm />} />
            <Route path="/profile" element={<Profile userEmail={session?.user?.email} userRole={userRole} />} />
            
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </ProtectedRoute>
      </ErrorBoundary>
    </HashRouter>
  );
};

export default Routes;