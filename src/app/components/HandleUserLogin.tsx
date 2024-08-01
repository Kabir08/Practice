'use client';

import { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

const HandleUserLogin = () => {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      const saveUser = async () => {
        try {
          const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: user.name,
              useremail: user.email,
              // Initialize additional fields with default values
              avatar: '', // Default empty string
              paymentId: '', // Default empty string
              paymentSecret: '', // Default empty string
              instagram: '', // Default empty string
              x: '', // Default empty string, rename if needed
              events: [] // Default empty array
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to save user');
          }

          const data = await response.json();
          console.log('User saved/updated:', data);
        } catch (error) {
          console.error('Error saving/updating user:', error);
        }
      };

      saveUser();
    }
  }, [user]);

  return null;
};

export default HandleUserLogin;
