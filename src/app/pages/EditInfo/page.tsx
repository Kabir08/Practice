// pages/EditInfo.tsx
'use client'
import React, { useEffect, useState, FormEvent } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

interface FormData {
  username: string;
  avatar: File | null;
  paymentId: string;
  paymentSecret: string;
  instagram: string;
  X: string;
}

const EditInfo: React.FC = () => {
  const { user, error, isLoading } = useUser();
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setAvatar(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarUrl(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    const formData = new FormData();
    formData.append('username', form.username.value);
    if (avatar) formData.append('avatar', avatar);
    formData.append('paymentId', form.paymentId.value);
    formData.append('paymentSecret', form.paymentSecret.value);
    formData.append('instagram', form.instagram.value);
    formData.append('X', form.X.value);

    
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });
      console.log(response)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Success:', result);
    } catch (error: any) {
      console.error('Error:', error.message);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return (
    <div className="p-6 bg-gray-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            defaultValue={user?.name || ''}
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
            <img src={avatarUrl} alt="Avatar Preview" className="mt-2 h-24 w-24 object-cover rounded-full" />
          )}
        </div>
        <div>
          <label htmlFor="paymentId" className="block text-sm font-medium text-gray-700">Payment Id</label>
          <input
            type="text"
            id="paymentId"
            name="paymentId"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="paymentSecret" className="block text-sm font-medium text-gray-700">Payment Secret</label>
          <input
            type="text"
            id="paymentSecret"
            name="paymentSecret"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">Add Instagram</label>
          <input
            type="text"
            id="instagram"
            name="instagram"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="X" className="block text-sm font-medium text-gray-700">Add X(Twitter)</label>
          <input
            type="text"
            id="X"
            name="X"
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
