'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from "@auth0/nextjs-auth0/client";
import Link from 'next/link';
import EventFormModal from '@/app/components/EventFormModal'; // Adjust the import path if necessary

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<{ username: string; avatar: string; instagram: string } | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'createdEvents' | 'yourEvents'>('createdEvents');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const { user: auth0User, isLoading, error } = useUser();

  useEffect(() => {
    // Fetch user profile data
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/getUser');
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

    fetchUserProfile();
  }, []);

  useEffect(() => {
    // Fetch all events data
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          console.error('Failed to fetch events');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    if (auth0User) {
      fetchEvents();
    }
  }, [auth0User]);

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

  if (isLoading) return <div>Loading.....</div>;
  if (error) return <div>{error.message}</div>;

  const userEvents = events.filter(event => event.creatorName === auth0User?.name);

  return (
    <div className='bg-blue-100 block mx-[17%] p-10'>
      <div className='flex justify-center items-center'>
        This is dashboard
      </div>
      <div className='flex items-center justify-between'>
        <div>
          {user?.avatar ? (
            <img src={`data:image/jpeg;base64,${user.avatar}`} alt="Profile Pic" className="h-24 w-24 rounded-full object-cover" />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gray-200"></div>
          )}
        </div>
        <div>
          <h2 className='text-xl font-bold'>{user?.username || 'User'}</h2>
          {user?.instagram && (
            <div className='flex items-center mt-2'>
              <a href={`https://www.instagram.com/${user.instagram}`} target="_blank" rel="noopener noreferrer">
                <img src="/Instagram_icon.png" alt="Instagram" className={`h-6 w-6 ${user.instagram ? '' : 'grayscale'}`} />
              </a>
            </div>
          )}
        </div>
      </div>
      <div className='flex justify-center items-center m-5 bg-blue-800 rounded-md p-2 w-[200px]'>
        <Link href="/pages/EditInfo">
          Tell us more
        </Link>
      </div>
      <div className='mt-10'>
        <div className="tabs">
          <button onClick={() => setActiveTab('createdEvents')} className={`tab ${activeTab === 'createdEvents' ? 'active' : ''}`}>
            Your Events
          </button>
          <button onClick={() => setActiveTab('yourEvents')} className={`tab ${activeTab === 'yourEvents' ? 'active' : ''}`}>
            Created Events
          </button>
        </div>
        <div className='mt-10'>
          {activeTab === 'createdEvents' && (
            <>
              <h2 className="text-2xl font-bold">Your Events</h2>
              <ul className="space-y-2 mt-4">
                {events.map((event) => (
                  <li key={event.event_id} className="bg-gray-100 p-4 rounded-md shadow-md">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">{event.eventName}</h3>
                    </div>
                    <p className="text-gray-700">{event.eventDescription}</p>
                    <p className="text-gray-700">Location: {event.eventLocation}</p>
                    <p className="text-gray-700">Expires at: {event.eventExpiry}</p>
                    <p className="text-gray-700">Color: {event.eventColor}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
          {activeTab === 'yourEvents' && (
            <>
              <h2 className="text-2xl font-bold">Created Events</h2>
              <ul className="space-y-2 mt-4">
                {userEvents.map((event) => (
                  <li key={event.event_id} className="bg-gray-100 p-4 rounded-md shadow-md">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">{event.eventName}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(event.event_id)}
                          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event.event_id)}
                          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700">{event.eventDescription}</p>
                    <p className="text-gray-700">Location: {event.eventLocation}</p>
                    <p className="text-gray-700">Expires at: {event.eventExpiry}</p>
                    <p className="text-gray-700">Color: {event.eventColor}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Event Form Modal */}
      <EventFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        initialData={editingEvent}
        creatorName={user?.username || 'Unknown'}
      />
    </div>
  );
};

export default Dashboard;
