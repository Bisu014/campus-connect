import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, subtitle }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-muted-foreground">{subtitle}</p>
          )}
        </header>
        <div className="animate-slide-up">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
