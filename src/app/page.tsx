'use client';
import React, { useState, useEffect, useCallback } from "react";
import EventFormModal from "@/app/components/EventFormModal"; // Adjust the path as per your project structure
import { useUser } from "@auth0/nextjs-auth0/client";
import debounce from 'lodash.debounce';
import { FaHeart, FaPlus, FaCheck } from 'react-icons/fa';

const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [likedEvents, setLikedEvents] = useState<Map<string, number>>(new Map()); // Map for likes count
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set()); // Set for liked event IDs
  const [addedEvents, setAddedEvents] = useState<Set<string>>(new Set()); // Set for added event IDs

  // Fetch events from the server
  const fetchEvents = async (query: string = '') => {
    try {
      const response = await fetch(`/api/events?search=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data: any[] = await response.json();
        setEvents(data);
        // Initialize likes count and user likes from the fetched events
        const likesMap = new Map(data.map(event => [event.event_id, event.likes || 0]));
        const userLikesSet = new Set(data.filter(event => event.userLiked).map(event => event.event_id));
        const addedEventsSet = new Set(data.filter(event => event.addedByUser).map(event => event.event_id)); // Assuming the property for added events
        setLikedEvents(likesMap);
        setUserLikes(userLikesSet);
        setAddedEvents(addedEventsSet);
      } else {
        console.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Include fetchEvents in the dependency array
  const debouncedFetchEvents = useCallback(debounce((query: string) => fetchEvents(query), 500), [fetchEvents]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    debouncedFetchEvents(query); // Call the debounced function
  };

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  // Handle form submission for creating or updating events
  const handleFormSubmit = async (formData: any) => {
    try {
      let response;
      formData.creatorName = user?.name ?? "Anonymous";

      if (editingEvent) {
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
          setEvents(events.map(event => (event.event_id === updatedEvent.event_id ? updatedEvent : event)));
          setEditingEvent(null); // Clear editing state
          console.log('Updated event:', updatedEvent);
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
          console.log('Created new event:', newEvent);
        } else {
          console.error('Failed to create event');
        }
      }

      setIsModalOpen(false); // Close the modal after submission
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const { user, error, isLoading } = useUser();

  const handleLike = async (eventId: string) => {
    const isLiked = userLikes.has(eventId);
    const newLikes = (likedEvents.get(eventId) || 0) + (isLiked ? -1 : 1);

    setLikedEvents(prev => new Map(prev).set(eventId, newLikes));
    setUserLikes(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });

    try {
      const response = await fetch(`/api/events/${eventId}/like`, { // Assuming this endpoint handles user-specific likes
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ liked: !isLiked }),
      });

      if (!response.ok) {
        throw new Error('Failed to update likes');
      }

      const data = await response.json();
      setLikedEvents(prev => new Map(prev).set(eventId, data.likes));
    } catch (error) {
      console.error('Error updating likes:', error);
      // Revert the like status on error
      setLikedEvents(prev => new Map(prev).set(eventId, (likedEvents.get(eventId) || 0) - (isLiked ? 1 : -1)));
      setUserLikes(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(eventId);
        } else {
          newSet.delete(eventId);
        }
        return newSet;
      });
    }
  };

  const handleAdd = async (eventId: string) => {
    if (!user) {
      alert('Please sign in to add events.');
      return;
    }

    const isAdded = addedEvents.has(eventId);

    try {
      const response = await fetch(`/api/users/${user.sub}/events`, { // Assuming this endpoint handles user-specific added events
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: eventId,
          action: isAdded ? 'remove' : 'add',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      const updatedUser = await response.json();
      setAddedEvents(prev => {
        const newSet = new Set(prev);
        if (isAdded) {
          newSet.delete(eventId);
        } else {
          newSet.add(eventId);
        }
        return newSet;
      });

    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const formatLikes = (count: number) => {
    if (count >= 1000) {
      return `${Math.floor(count / 1000)}k+`;
    }
    return count.toString();
  };

  if (isLoading) return <div>Loading.....</div>;
  if (error) return <div>{error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-end mb-4">
        {user ? (
          <button onClick={openModal} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md">
            Create Event
          </button>
        ) : (
          <button className="bg-blue-300 text-white py-2 px-4 rounded-md cursor-not-allowed" disabled>
            Create Event (Sign In Required)
          </button>
        )}
      </div>

      <EventFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        initialData={editingEvent}
        creatorName={user?.name ?? "Anonymous"}
      />

      <div className={`space-y-4 ${!user ? 'blur-sm' : ''}`}>
        <h2 className="text-2xl font-bold">Events</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          className="mb-4 p-2 border border-gray-300 rounded-md w-full max-w-md"
          placeholder="Search events..."
        />
        <ul className="space-y-2">
          {events.map((event) => (
            <li key={event.event_id} className="bg-gray-100 p-4 rounded-md shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <h3 className="text-lg font-semibold">{event.eventName}</h3>
                <div>
                  <h2 className="text-md font-medium">{event.creatorName}</h2>
                </div>
              </div>
              <p className="text-gray-700 mt-2 text-sm line-clamp-2">{event.eventDescription}</p>
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center">
                  <button
                    onClick={() => handleLike(event.event_id)}
                    className={`mr-2 text-pink-500 hover:text-pink-600 focus:outline-none ${userLikes.has(event.event_id) ? 'text-pink-600' : ''}`}
                  >
                    <FaHeart />
                  </button>
                  <span className="text-gray-600 text-sm">{formatLikes(likedEvents.get(event.event_id) || 0)} Likes</span>
                </div>
                <button
                  onClick={() => handleAdd(event.event_id)}
                  className="text-green-500 hover:text-green-600 focus:outline-none"
                >
                  {addedEvents.has(event.event_id) ? <FaCheck /> : <FaPlus />}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {!user && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-md shadow-lg text-center">
            <p className="text-lg font-semibold mb-4">Please sign in to view and create events.</p>
            <a href="/api/auth/login" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md">
              Sign In
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
