'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from "@auth0/nextjs-auth0/client";
import Link from 'next/link';
import EventFormModal from '@/app/components/EventFormModal'; // Adjust the import path if necessary
import debounce from 'lodash/debounce';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<{ username: string; avatar: string; instagram: string } | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [createdEvents, setCreatedEvents] = useState<any[]>([]);
  const [addedEvents, setAddedEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'createdEvents' | 'yourEvents'>('createdEvents');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const { user: auth0User, isLoading, error } = useUser();

  // Fetch user profile data from the appropriate endpoint
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!auth0User || !auth0User.email) {
        return;
      }
      try {
        const response = await fetch(`/api/users?email=${encodeURIComponent(auth0User.email)}`);
        if (response.ok) {
          const data = await response.json();
          setUser({
            username: data.username,
            avatar: data.avatar,
            instagram: data.instagram
          });
        } else {
          console.error('Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (auth0User) {
      fetchUserProfile();
    }
  }, [auth0User]);

  useEffect(() => {
    // Debounced function to fetch events
    const fetchEvents = debounce(async () => {
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
          setCreatedEvents(data.filter((event: { creatorName: string | null | undefined; }) => event.creatorName === auth0User?.name));
          setAddedEvents(data.filter((event: { addedByUser: string | null | undefined; }) => event.addedByUser === auth0User?.name));
        } else {
          console.error('Failed to fetch events');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    }, 500); // Debounce delay of 500ms

    if (auth0User) {
      fetchEvents(); // Fetch events if user is authenticated
    }

    return () => {
      fetchEvents.cancel(); // Cleanup debounce on component unmount
    };
  }, [auth0User]); // Only re-fetch if auth0User changes

  const openModal = (eventToEdit: any) => {
    setEditingEvent(eventToEdit);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      let response;
      if (formData.event_id) {
        // Update existing event
        response = await fetch(`/api/events/${formData.event_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const updatedEvent = await response.json();
          // Update events state with the updated event
          setEvents(events.map(event => (event.event_id === updatedEvent.event_id ? updatedEvent : event)));
          setEditingEvent(null); // Clear editing state
        } else {
          console.error('Failed to update event');
        }
      } else {
        // Create new event
        response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const newEvent = await response.json();
          setEvents([...events, newEvent]); // Add new event to events state
        } else {
          console.error('Failed to create event');
        }
      }

      closeModal(); // Close the modal after submission
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (eventId: any) => {
    // Find the event to edit by its ID
    const eventToEdit = events.find(event => event.event_id === eventId);
    if (eventToEdit) {
      openModal(eventToEdit);
    } else {
      console.error('Event not found');
    }
  };

  const handleDelete = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetch(`/api/events/${eventId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setEvents(events.filter(event => event.event_id !== eventId));
        } else {
          console.error('Failed to delete event');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleAddEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH', // Assuming you need to update the event
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addedByUser: auth0User?.name }),
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        setEvents(events.map(event => (event.event_id === updatedEvent.event_id ? updatedEvent : event)));
      } else {
        console.error('Failed to update event');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (isLoading) return <div>Loading.....</div>;
  if (error) return <div>{error.message}</div>;

  return (
    <div className='bg-blue-100 p-6 md:p-10 mx-4 md:mx-8 lg:mx-16 xl:mx-32'>
      <div className='flex flex-col md:flex-row items-center md:justify-between'>
        <div className='flex flex-col items-center md:items-start'>
          {user?.avatar ? (
            <img src={`data:image/jpeg;base64,${user.avatar}`} alt="Profile Pic" className="h-24 w-24 rounded-full object-cover" />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gray-200"></div>
          )}
          <h2 className='text-xl font-bold mt-4'>{user?.username || 'User'}</h2>
        </div>
        <div className='flex flex-col items-center md:items-end mt-4 md:mt-0'>
          {user?.instagram && (
            <div className='flex items-center'>
              <a href={`https://www.instagram.com/${user.instagram}`} target="_blank" rel="noopener noreferrer">
                <img src="/Instagram_icon.png" alt="Instagram" className={`h-6 w-6 ${user.instagram ? '' : 'grayscale'}`} />
              </a>
            </div>
          )}
          <div className='mt-4'>
            <div className='bg-blue-800 rounded-md p-2'>
              <Link href="/pages/EditInfo">
                Tell us more
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className='mt-8'>
        <div className="flex justify-around md:justify-start gap-4 mb-4">
          <button onClick={() => setActiveTab('createdEvents')} className={`tab ${activeTab === 'createdEvents' ? 'bg-blue-600 text-white' : 'bg-blue-200 text-blue-800'} px-4 py-2 rounded-md`}>
            Created Events
          </button>
          <button onClick={() => setActiveTab('yourEvents')} className={`tab ${activeTab === 'yourEvents' ? 'bg-blue-600 text-white' : 'bg-blue-200 text-blue-800'} px-4 py-2 rounded-md`}>
            Your Events
          </button>
        </div>
        <div className='mt-4'>
          {activeTab === 'createdEvents' && (
            <>
              <h2 className="text-2xl font-bold mb-4">Created Events</h2>
              <ul className="space-y-4">
                {createdEvents.map((event) => (
                  <li key={event.event_id} className="bg-gray-100 p-4 rounded-md shadow-md">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <h3 className="text-lg font-semibold">{event.eventName}</h3>
                      <div className="flex space-x-2 mt-2 md:mt-0">
                        <button
                          onClick={() => handleEdit(event.event_id)}
                          className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event.event_id)}
                          className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="mt-2">{event.eventDescription}</p>
                    <button
                      onClick={() => handleAddEvent(event.event_id)}
                      className="bg-green-500 text-white px-4 py-2 mt-4 rounded-md hover:bg-green-600"
                    >
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {activeTab === 'yourEvents' && (
            <>
              <h2 className="text-2xl font-bold mb-4">Your Events</h2>
              <ul className="space-y-4">
                {addedEvents.map((event) => (
                  <li key={event.event_id} className="bg-gray-100 p-4 rounded-md shadow-md">
                    <h3 className="text-lg font-semibold">{event.eventName}</h3>
                    <p className="mt-2">{event.eventDescription}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
      {isModalOpen && (
        <EventFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        initialData={editingEvent} // Corrected prop name
        creatorName={user?.username || 'Unknown'}
      />
      )}
    </div>
  );
};

export default Dashboard;
