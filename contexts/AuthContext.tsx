import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseInitialized } from '../services/firebase';

// Updated Schema based on user's database
export interface UserProfile {
  uid: string;
  email: string | null;
  username?: string;
  isReseller: boolean;
  isAdmin?: boolean; 
  walletBalance: number;
  savingsBalance?: number;
  commissionBalance?: number;
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

  useEffect(() => {
    // PREVENT CRASH: Check if firebase is initialized before using SDK
    if (!isFirebaseInitialized) {
        console.log("Running in offline mode (No Firebase Keys)");
        setLoading(false);
        return;
    }

    // Real-time listener for Auth State
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Real-time listener for User Profile in Firestore
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            console.log("No user profile found");
            setUserProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user profile:", error);
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const refreshProfile = async () => {
    if (!isFirebaseInitialized || !currentUser) return;
    
    // With onSnapshot, manual refresh is rarely needed, but kept for compatibility
    if (currentUser) {
       const userRef = doc(db, 'users', currentUser.uid);
       const docSnap = await getDoc(userRef);
       if (docSnap.exists()) {
         setUserProfile(docSnap.data() as UserProfile);
       }
    }
  };

  const updateRole = async (isReseller: boolean) => {
    // This serves as a local optimistic update, but Firestore listener will correct it
    if (userProfile) {
        setUserProfile({ ...userProfile, isReseller });
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, refreshProfile, updateRole }}>
      {children}
    </AuthContext.Provider>
  );
};