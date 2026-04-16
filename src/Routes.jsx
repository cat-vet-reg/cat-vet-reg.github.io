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
import Login               from "./Login";

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

            <Route 
              path="/login" 
              element={!session ? <Login /> : <Navigate to="/" />} 
            />
            
            {/* ЗАЩИТЕНИ СТРАНИЦИ */}
            <Route path="/" element={session ? <Schedule /> : <Navigate to="/login" />} />
            <Route path="/dashboard-overview" element={session ? <DashboardOverview /> : <Navigate to="/login" />} />
            <Route path="/cat-profile-details/:id" element={session ? <CatProfileDetails /> : <Navigate to="/login" />} />
            <Route path="/schedule" element={session ? <Schedule /> : <Navigate to="/login" />} />
            <Route path="/today" element={session ? <Today /> : <Navigate to="/login" />} />
            <Route path="/cat-registry-list" element={session ? <CatRegistryList /> : <Navigate to="/login" />} />
            <Route path="/treatment-registry" element={session ? <TreatmentRegistry /> : <Navigate to="/login" />} />
            <Route path="/interactive-cat-map" element={session ? <InteractiveCatMap /> : <Navigate to="/login" />} />
            <Route path="/statistics" element={session ? <StatisticsTable /> : <Navigate to="/login" />} />
            <Route path="/cat-registration-form" element={session ? <CatRegistrationForm /> : <Navigate to="/login" />} />
            <Route path="/profile" element={session ? <Profile userEmail={session?.user?.email} userRole={userRole} /> : <Navigate to="/login" />} />
            
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </ProtectedRoute>
      </ErrorBoundary>
    </HashRouter>
  );
};

export default Routes;