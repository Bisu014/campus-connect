import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('campusGrievanceUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Query the users collection to find the user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.toLowerCase().trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { success: false, error: 'User not found. Please contact the administrator.' };
      }

      const userData = querySnapshot.docs[0].data() as User;
      setUser(userData);
      localStorage.setItem('campusGrievanceUser', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Failed to connect to the database. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('campusGrievanceUser');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
