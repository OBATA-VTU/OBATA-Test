import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, isFirebaseInitialized } from '../services/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isReseller: boolean;
  refreshProfile: () => Promise<void>; // Added for manual refresh if needed, though listener handles it
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
    if (!isFirebaseInitialized) {
        console.warn("AuthContext running in Mock Mode");
        setLoading(false);
        return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Set up real-time listener
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            console.error("User profile document missing for UID:", user.uid);
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

  const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout failed:", error);
    }
  };

  // Helper for manual refresh if strictly necessary (e.g. after a cloud function update that might not reflect immediately in local cache)
  const refreshProfile = async () => {
      // Listener handles updates automatically, this is mostly a no-op placeholder or for forcing a re-fetch if we were not using listeners
      // For onSnapshot, we don't strictly need this, but we keep it for interface compatibility
      return Promise.resolve();
  };

  return (
    <AuthContext.Provider value={{ 
        currentUser, 
        userProfile, 
        loading, 
        logout,
        isAdmin: userProfile?.role === 'admin',
        isReseller: userProfile?.role === 'reseller' || userProfile?.role === 'admin',
        refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};