import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type UserRole = 'USER' | 'RESELLER' | 'ADMIN';

export interface UserProfile {
  uid: string;
  email: string | null;
  username: string;
  role: UserRole;
  walletBalance: number;
  referralCode: string;
  referredBy: string | null;
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateRole: (newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const updateRole = async (newRole: UserRole) => {
    if (!currentUser || !userProfile) return;
    try {
      const docRef = doc(db, 'users', currentUser.uid);
      await setDoc(docRef, { role: newRole }, { merge: true });
      setUserProfile({ ...userProfile, role: newRole });
    } catch (error) {
      console.error("Error updating role:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshProfile = async () => {
    if (currentUser) await fetchUserProfile(currentUser.uid);
  };

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, refreshProfile, updateRole }}>
      {children}
    </AuthContext.Provider>
  );
};