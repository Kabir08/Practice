'use client';
import React, { useEffect, useState } from 'react';
import { useUser } from "@auth0/nextjs-auth0/client";
import EventFormModal from "@/app/components/EventFormModal"; // Adjust the path as needed

const YourEventsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const { user, error, isLoading } = useUser();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        const userEvents = data.filter((event: any) => event.creatorName === user?.name);
        setEvents(userEvents);
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
          setEditingEvent(null);
        } else {
          console.error('Failed to update event');
        }
      } else {
        response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const newEvent = await response.json();
          setEvents([...events, newEvent]);
        } else {
          console.error('Failed to create event');
        }
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (eventId: any) => {
    const eventToEdit = events.find(event => event.event_id === eventId);
    if (eventToEdit) {
      setEditingEvent(eventToEdit);
      setIsModalOpen(true);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-end mb-4">
        <button onClick={openModal} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md">
          Create Event
        </button>
      </div>

      <EventFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        initialData={editingEvent}
        creatorName={user?.name ?? "Anonymous"}
      />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Events</h2>
        <ul className="space-y-2">
          {events.map((event) => (
            <li key={event.event_id} className="bg-gray-100 p-4 rounded-md shadow-md">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{event.eventName}</h3>
                <div>
                  <button
                    onClick={() => handleEdit(event.event_id)}
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.event_id)}
                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md ml-2"
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
      </div>
    </div>
  );
};

export default YourEventsPage;
