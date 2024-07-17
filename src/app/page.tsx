'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import EventFormModal from "@/app/components/EventFormModal"; // Adjust the path as per your project structure
import { v4 as uuidv4 } from 'uuid';
import { useUser } from "@auth0/nextjs-auth0/client";

const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

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

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      let response;

      if (editingEvent) {
        // Update existing event
        response = await fetch(`/api/events/${formData.event_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        console.log(response)

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

      setIsModalOpen(false); // Close the modal after submission
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (eventId: any) => {
    // Find the event to edit by its ID
    const eventToEdit = events.find(event => event.event_id === eventId);
    if (eventToEdit) {
      setEditingEvent(eventToEdit);
      setIsModalOpen(true); // Open the modal with the event data
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
        console.log(response)
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

  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading.....</div>;
  if (error) return <div>{error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-end mb-4">
        <button onClick={openModal} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md">
          Create Event
        </button>
      </div>

      <EventFormModal isOpen={isModalOpen} onClose={closeModal} onSubmit={handleFormSubmit} initialData={editingEvent} />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Events</h2>
        <ul className="space-y-2">
          {events.map((event) => (
            <li key={event.event_id} className="bg-gray-100 p-4 rounded-md shadow-md">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{event.eventName}</h3>
                {user && (
                  <div>
                    <h2>{user.name}</h2>
                  </div>
                )}
              </div>
              <p className="text-gray-700">{event.eventDescription}</p>
              <p className="text-gray-700">Location: {event.eventLocation}</p>
              <p className="text-gray-700">Expires at: {event.eventExpiry}</p>
              <p className="text-gray-700">Color: {event.eventColor}</p>
              <div className="flex space-x-2 mt-2">
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
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default HomePage;
