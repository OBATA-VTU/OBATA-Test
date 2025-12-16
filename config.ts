// Safely access environment variables
const getEnv = (key: string): string => {
  // @ts-ignore
  return import.meta.env?.[key] || '';
};

export const config = {
  firebase: {
    apiKey: getEnv('VITE_FIREBASE_API_KEY'),
    authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnv('VITE_FIREBASE_APP_ID'),
    measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID')
  },
  api: {
    inlomaxBaseUrl: getEnv('VITE_INLOMAX_BASE_URL') || 'https://inlomax.com/api',
    inlomaxKey: getEnv('VITE_INLOMAX_API_KEY'),
    paystackKey: getEnv('VITE_PAYSTACK_PUBLIC_KEY'),
  },
  site: {
    name: 'OBATA VTU',
    currency: 'NGN',
    supportEmail: 'support@obatavtu.com',
  }
};