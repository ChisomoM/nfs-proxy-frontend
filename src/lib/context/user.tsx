import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';

interface UserContextType {
  user: User | null;
  oAuthLogin: (userData: { id: string; provider: string; displayName: string; email: string; photo: string }) => Promise<void>;
  oAuthRegister: (userData: { id: string; provider: string; displayName: string; email: string; photo: string }) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user] = useState<User | null>(null);

  const oAuthLogin = async (userData: { id: string; provider: string; displayName: string; email: string; photo: string }) => {
    console.log(userData);
    // Add login logic here
  };

  const oAuthRegister = async (userData: { id: string; provider: string; displayName: string; email: string; photo: string }) => {
    console.log(userData);
    // Add register logic here
  };

  return (
    <UserContext.Provider value={{ user, oAuthLogin, oAuthRegister }}>
      {children}
    </UserContext.Provider>
  );
};;

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};