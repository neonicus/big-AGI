import * as React from 'react';
import Script from 'next/script';

import { useAuthStore } from '~/common/stores/store-auth';
import { addSnackbar } from '~/common/components/snackbar/useSnackbarsStore';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID || '';

/**
 * Provider that initializes Google Identity Services (GSI)
 * and handles the "One Tap" login flow.
 */
export function ProviderGoogleAuth(props: { children: React.ReactNode }) {

  // external state
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  // handle the credential response from Google
  const handleCredentialResponse = React.useCallback((response: any) => {
    try {
      const idToken = response.credential;
      // Decode the JWT (base64) - safe way to get basic profile without another API call
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      
      setUser({
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
      }, idToken);

      addSnackbar({
        key: 'google-auth-success',
        message: `Welcome back, ${payload.name || payload.email}!`,
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to decode Google ID Token:', error);
      addSnackbar({
        key: 'google-auth-error',
        message: 'Authentication failed. Please try again.',
        type: 'issue',
      });
    }
  }, [setUser]);

  // initialize GSI when the script loads
  const onGsiScriptLoad = React.useCallback(() => {
    if (!GOOGLE_CLIENT_ID || typeof window === 'undefined' || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: true, // try to auto-login if possible
    });

    // only show One Tap if not logged in
    if (!user) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // console.log('One Tap not displayed:', notification.getNotDisplayedReason());
        }
      });
    }
  }, [handleCredentialResponse, user]);

  return <>
    <Script
      src="https://accounts.google.com/gsi/client"
      onLoad={onGsiScriptLoad}
      strategy="afterInteractive"
    />
    {props.children}
  </>;
}

// Add global type for Google Identity Services
declare global {
  interface Window {
    google?: any;
  }
}
