import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Updated Schema based on user's database
export interface UserProfile {
  uid: string;
  email: string | null;
  username?: string;
  isReseller: boolean;
  isAdmin?: boolean; // Added for Admin Panel protection
  walletBalance: number;
  referralCode: string;
  referredBy: string | null;
  createdAt: any; 
  
  // Specific fields
  apiKey: string;
  photoURL: string | null;
  transactionPin: string;
  emailNotificationsEnabled: boolean;
  hasFunded: boolean;
  hasMadePurchase: boolean;
  totalPurchaseValue: number;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateRole: (isReseller: boolean) => Promise<void>;
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
        const data = docSnap.data();
        setUserProfile({
            uid: data.uid,
            email: data.email,
            username: data.username,
            isReseller: data.isReseller ?? false,
            isAdmin: data.isAdmin ?? false, // Check for admin status
            walletBalance: data.walletBalance ?? 0,
            referralCode: data.referralCode,
            referredBy: data.referredBy,
            createdAt: data.createdAt,
            apiKey: data.apiKey || '',
            photoURL: data.photoURL || null,
            transactionPin: data.transactionPin || '0000',
            emailNotificationsEnabled: data.emailNotificationsEnabled ?? true,
            hasFunded: data.hasFunded ?? false,
            hasMadePurchase: data.hasMadePurchase ?? false,
            totalPurchaseValue: data.totalPurchaseValue ?? 0
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const updateRole = async (isReseller: boolean) => {
    if (!currentUser || !userProfile) return;
    try {
      const docRef = doc(db, 'users', currentUser.uid);
      await setDoc(docRef, { isReseller: isReseller }, { merge: true });
      setUserProfile({ ...userProfile, isReseller: isReseller });
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