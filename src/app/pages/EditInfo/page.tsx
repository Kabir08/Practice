'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

interface FormData {
  uuid?: string;
  username: string;
  avatar: string | null;
  paymentId: string;
  paymentSecret: string;
  instagram: string;
  x: string;
}



const EditInfo: React.FC = () => {
  const { user, error, isLoading } = useUser();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    avatar: null,
    paymentId: '',
    paymentSecret: '',
    instagram: '',
    x: '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) { // Ensure user.email is defined
      const fetchUserData = async () => {
        try {
          // Using encodeURIComponent to handle user.email safely
          const email: string = user.email as string;
          const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }

          const textResponse = await response.text();
          console.log('Raw response:', textResponse);

          const contentType = response.headers.get('Content-Type');
          if (contentType && contentType.includes('application/json')) {
            const userData = JSON.parse(textResponse);
            setFormData({
              uuid: userData.uuid,
              username: userData.username,
              avatar: null, // Will be updated separately
              paymentId: userData.paymentId,
              paymentSecret: userData.paymentSecret,
              instagram: userData.instagram,
              x: userData.x,
            });
            setAvatarUrl(userData.avatar);
          } else {
            console.error('Response is not JSON');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserData();
    }
  }, [user]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, avatar: base64String });
        setAvatarUrl(base64String);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, avatar: '' });
      setAvatarUrl(null);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user?.email) {
      console.error('User email is required');
      return;
    }

    try {
      // Send updated user data to the server
      const response = await fetch(`/api/users?email=${encodeURIComponent(user.email)}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch user data: ${errorText}`);
      }
      console.log(response)
      const textResponse = await response.text();
      console.log('Raw response:', textResponse);
      const contentType = response.headers.get('Content-Type');

      if (contentType && contentType.includes('application/json')) {
        const userData = JSON.parse(textResponse);

        const endpoint = userData.uuid ? `/api/users/${userData.uuid}` : `/api/users`;

        const submitData = {
          uuid: userData.uuid || uuidv4(),
          username: formData.username,
          avatar: formData.avatar,
          paymentId: formData.paymentId,
          paymentSecret: formData.paymentSecret,
          instagram: formData.instagram,
          x: formData.x,
        };

        const apiResponse = await fetch(endpoint, {
          method: userData.uuid ? 'PATCH' : 'POST', // Use PATCH if UUID exists, otherwise POST
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        });

        if (!apiResponse.ok) {
          const errorText = await apiResponse.text();
          throw new Error(`Failed to submit data: ${errorText}`);
        }

        const result = await apiResponse.json();
        console.log('Success:', result);
      } else {
        console.error('Response is not JSON');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return (
    <div className="p-6 bg-gray-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form fields */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">Avatar</label>
          <input
            type="file"
            name="avatar"
            id="avatar"
            onChange={handleAvatarChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
          />
          {avatarUrl && (
            <Image src={avatarUrl} alt="Avatar Preview" className="mt-2 h-24 w-24 object-cover rounded-full" />
          )}
        </div>
        <div>
          <label htmlFor="paymentId" className="block text-sm font-medium text-gray-700">Payment Id <span className="text-sm font-light">(recommended)</span></label>
          <input
            type="text"
            id="paymentId"
            name="paymentId"
            value={formData.paymentId}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="paymentSecret" className="block text-sm font-medium text-gray-700">Payment Secret <span className="text-sm font-light">(recommended)</span></label>
          <input
            type="text"
            id="paymentSecret"
            name="paymentSecret"
            value={formData.paymentSecret}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">Add Instagram User Id</label>
          <input
            type="text"
            id="instagram"
            name="instagram"
            value={formData.instagram}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="x" className="block text-sm font-medium text-gray-700">Add X(Twitter) User Id</label>
          <input
            type="text"
            id="x"
            name="x"
            value={formData.x}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditInfo;
