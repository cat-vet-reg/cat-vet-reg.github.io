import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
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
import Profile               from './pages/profile';
import { HashRouter }      from "react-router-dom";

const Routes = ({ session, userRole }) => {
  return (
    <HashRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/cat-profile-details/:id" element={<CatProfileDetails />} />
        <Route path="/dashboard-overview" element={<DashboardOverview />} />
        <Route path="/cat-registry-list" element={<CatRegistryList />} />
        <Route path="/interactive-cat-map" element={<InteractiveCatMap />} />
        <Route path="/cat-registration-form" element={<CatRegistrationForm />} />
        <Route path="/statistics" element={<StatisticsTable />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/treatment-registry" element={<TreatmentRegistry />} />
        <Route path="/today" element={<Today />} />
        <Route path="/profile" element={<Profile userEmail={session?.user?.email} userRole={userRole} />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </HashRouter>
  );
};

export default Routes;
