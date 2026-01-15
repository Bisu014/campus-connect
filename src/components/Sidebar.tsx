import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Clock, 
  LogOut, 
  Shield,
  GraduationCap 
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const getNavItems = () => {
    const baseItems = [
      { 
        path: '/dashboard', 
        label: 'Dashboard', 
        icon: <LayoutDashboard className="w-5 h-5" /> 
      },
    ];

    if (user.role === 'student') {
      return [
        ...baseItems,
        { 
          path: '/lodge-complaint', 
          label: 'Lodge Complaint', 
          icon: <PlusCircle className="w-5 h-5" /> 
        },
        { 
          path: '/my-complaints', 
          label: 'My Complaints', 
          icon: <Clock className="w-5 h-5" /> 
        },
      ];
    }

    // Admin gets admin panel access
    if (user.role === 'admin') {
      return [
        ...baseItems,
        { 
          path: '/all-complaints', 
          label: 'All Complaints', 
          icon: <FileText className="w-5 h-5" /> 
        },
        { 
          path: '/admin-panel', 
          label: 'Admin Panel', 
          icon: <Shield className="w-5 h-5" /> 
        },
      ];
    }

    // HOD and Principal
    return [
      ...baseItems,
      { 
        path: '/all-complaints', 
        label: user.role === 'hod' ? 'Department Complaints' : 'All Complaints', 
        icon: <FileText className="w-5 h-5" /> 
      },
    ];
  };

  const getRoleBadgeColor = () => {
    switch (user.role) {
      case 'admin':
      case 'principal':
        return 'bg-accent';
      case 'hod':
        return 'bg-success';
      default:
        return 'bg-primary';
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold">CampusGrievance</h1>
            <p className="text-xs text-sidebar-foreground/60">Complaint Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {getNavItems().map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full nav-link ${isActive(item.path) ? 'nav-link-active' : ''}`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user.name}</p>
            <div className="flex items-center gap-2">
              <span className={`${getRoleBadgeColor()} text-white text-xs px-2 py-0.5 rounded-full capitalize`}>
                {user.role}
              </span>
              {user.branch && (
                <span className="text-xs text-sidebar-foreground/60">{user.branch}</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full nav-link text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
