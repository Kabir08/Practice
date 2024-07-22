import React, { useEffect, useState } from 'react';

interface IUser {
  _id: string;
  auth0Id: string;
  username: string;
  avatar?: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
}

const UserProfile: React.FC = () => {
  const [userData, setUserData] = useState<IUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInstagramValid, setIsInstagramValid] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/getUser');
        console.log(response)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: IUser = await response.json();
        setUserData(data);

        if (data.instagram) {
          // Check if Instagram username is valid
          const instagramResponse = await fetch(`https://www.instagram.com/${data.instagram}/`);
          setIsInstagramValid(instagramResponse.ok);
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };

    fetchUserData();
  }, []);

  if (error) return <div>{error}</div>;
  if (!userData) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-gray-100">
      <div className="flex items-center space-x-4">
        {userData.avatar && <img src={`data:image/jpeg;base64,${userData.avatar}`} alt="Avatar" className="h-24 w-24 rounded-full" />}
        <div>
          <h2 className="text-xl font-bold">{userData.username}</h2>
          <div className="flex space-x-4 mt-2">
            {userData.instagram && (
              isInstagramValid ? (
                <a href={`https://www.instagram.com/${userData.instagram}`} target="_blank" rel="noopener noreferrer">
                  <img src="/instagram-icon.png" alt="Instagram" className="h-6 w-6" />
                </a>
              ) : (
                <img src="/instagram-icon-gray.png" alt="Instagram" className="h-6 w-6 grayscale" />
              )
            )}
            {/* Add other social icons here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
