// VAPID Key Management for Push Notifications
// These keys need to be generated and stored in Supabase secrets

export const VAPID_PUBLIC_KEY = 'BEl62iUYgUivyIFKdvPlrAcBjjjbAOpxaVYm_rOGqhFVKFLw0VLFLOPnJCyJGPmfSDjBz_7pRvNBq9bVnFzL5ug';

// To generate VAPID keys, use:
// npm install -g web-push
// web-push generate-vapid-keys
//
// Then store them in Supabase secrets:
// VAPID_PUBLIC_KEY: The public key (used in frontend)
// VAPID_PRIVATE_KEY: The private key (used in edge function)

export const generateVapidKeys = () => {
  console.log('To generate VAPID keys, run:');
  console.log('npm install -g web-push');
  console.log('web-push generate-vapid-keys');
  console.log('');
  console.log('Then add the keys to Supabase secrets:');
  console.log('- VAPID_PUBLIC_KEY: [public key]');
  console.log('- VAPID_PRIVATE_KEY: [private key]');
};

// Helper function to convert public key for subscription
export const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};