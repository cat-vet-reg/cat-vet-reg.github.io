import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import StatCard from './components/StatCard';
import RecentActivityCard from './components/RecentActivityCard';
import QuickActionButton from './components/QuickActionButton';
import MiniMap from './components/MiniMap';
import SearchBar from './components/SearchBar';
import Icon from '../../components/AppIcon';


const DashboardOverview = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const statsData = [
  {
    title: "Total Registered Cats",
    value: "247",
    change: "+12.5%",
    changeType: "positive",
    trend: "vs last month",
    icon: "Cat",
    iconColor: "var(--color-primary)"
  },
  {
    title: "Recent Registrations",
    value: "18",
    change: "+6",
    changeType: "positive",
    trend: "this week",
    icon: "TrendingUp",
    iconColor: "var(--color-success)"
  },
  {
    title: "Active Locations",
    value: "42",
    change: "+3",
    changeType: "positive",
    trend: "new areas",
    icon: "MapPin",
    iconColor: "var(--color-secondary)"
  },
  {
    title: "Complete Profiles",
    value: "89%",
    change: "+2.3%",
    changeType: "positive",
    trend: "completion rate",
    icon: "CheckCircle",
    iconColor: "var(--color-accent)"
  }];


  const recentActivities = [
  {
    id: 1,
    name: "Whiskers",
    gender: "Male",
    image: "https://images.unsplash.com/photo-1456082981076-c3f00302c876",
    imageAlt: "Orange tabby cat with white chest sitting on wooden surface looking directly at camera with bright green eyes",
    location: "Central Park, Manhattan",
    ownerName: "Sarah Johnson",
    registeredTime: "2 hours ago"
  },
  {
    id: 2,
    name: "Luna",
    gender: "Female",
    image: "https://images.unsplash.com/photo-1638342863734-ef786438c9e7",
    imageAlt: "White and gray tabby kitten with blue eyes lying on soft gray blanket looking upward with curious expression",
    location: "Brooklyn Heights",
    ownerName: "Michael Chen",
    registeredTime: "5 hours ago"
  },
  {
    id: 3,
    name: "Shadow",
    gender: "Male",
    image: "https://images.unsplash.com/photo-1650940924722-092e81c9d78c",
    imageAlt: "Sleek black cat with bright yellow eyes sitting on wooden floor in dimly lit room with mysterious expression",
    location: "Queens, Long Island",
    ownerName: "Emily Rodriguez",
    registeredTime: "8 hours ago"
  },
  {
    id: 4,
    name: "Mittens",
    gender: "Female",
    image: "https://images.unsplash.com/photo-1643305760386-665f877088f7",
    imageAlt: "Fluffy white and gray tabby cat with green eyes lying comfortably on soft beige blanket looking content",
    location: "Staten Island",
    ownerName: "David Kim",
    registeredTime: "12 hours ago"
  }];


  const quickActions = [
  {
    title: "Register New Cat",
    description: "Add a new cat to the registry with complete details and location information",
    icon: "Plus",
    iconColor: "var(--color-primary)",
    path: "/cat-registration-form"
  },
  {
    title: "View Interactive Map",
    description: "Explore registered cats on an interactive map showing their found locations",
    icon: "Map",
    iconColor: "var(--color-secondary)",
    path: "/interactive-cat-map"
  },
  {
    title: "Browse Registry",
    description: "View complete list of all registered cats with search and filter options",
    icon: "List",
    iconColor: "var(--color-accent)",
    path: "/cat-registry-list"
  }];


  const registrationHotspots = [
  { area: "Manhattan", count: 89, color: "var(--color-primary)" },
  { area: "Brooklyn", count: 67, color: "var(--color-secondary)" },
  { area: "Queens", count: 54, color: "var(--color-accent)" },
  { area: "Bronx", count: 37, color: "var(--color-success)" }];


  const searchSuggestions = [
  { id: 1, name: "Whiskers", owner: "Sarah Johnson" },
  { id: 2, name: "Luna", owner: "Michael Chen" },
  { id: 3, name: "Shadow", owner: "Emily Rodriguez" },
  { id: 4, name: "Mittens", owner: "David Kim" },
  { id: 5, name: "Tiger", owner: "Jessica Martinez" }];


  const handleRegisterCat = () => {
    navigate('/cat-registration-form');
  };

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard-overview' }]} />

          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-2">
              Dashboard Overview
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Welcome back! Here's what's happening with cat registrations today.
            </p>
          </div>

          <div className="mb-6 md:mb-8">
            <SearchBar suggestions={searchSuggestions} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {statsData.map((stat, index) =>
            <StatCard key={index} {...stat} />
            )}
          </div>

          {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg shadow-warm p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-semibold text-foreground">Recent Activity</h2>
                  <button
                    onClick={() => navigate('/cat-registry-list')}
                    className="text-sm text-primary hover:text-primary/80 transition-smooth flex items-center gap-2">

                    <span>View All</span>
                    <Icon name="ArrowRight" size={16} />
                  </button>
                </div>
                <div className="space-y-3 md:space-y-4">
                  {recentActivities.map((cat) =>
                  <RecentActivityCard key={cat.id} cat={cat} />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="bg-card rounded-lg shadow-warm p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  {quickActions.map((action, index) =>
                  <QuickActionButton key={index} {...action} />
                  )}
                </div>
              </div>
            </div>
          </div> */}

          <div className="mb-6 md:mb-8">
            <MiniMap registrationHotspots={registrationHotspots} />
          </div>
        </div>
      </div>

      <FloatingActionButton onClick={handleRegisterCat} />
    </>);

};

export default DashboardOverview;