'use client'
import React, { useState, useEffect } from "react";
import Image from "next/image";
import EventFormModal from "@/app/components/EventFormModal"; // Adjust the path as per your project structure
import { v4 as uuidv4 } from 'uuid';

const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);

  useEffect(() => {
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

    fetchEvents();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      let response;
      if (editingEvent) {
        response = await fetch(`/api/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const updatedEvent = await response.json();
          setEvents(events.map(event => (event.id === updatedEvent.id ? updatedEvent : event)));
          setEditingEvent(null);
        } else {
          console.error('Failed to update event');
        }
      } else {
        formData.id = uuidv4(); // Assign UUID v4 to new event
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
      closeModal();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetch(`/api/events/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setEvents(events.filter(event => event.id !== id));
        } else {
          console.error('Failed to delete event');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

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
            <li key={event.id} className="bg-gray-100 p-4 rounded-md shadow-md">
              <h3 className="text-lg font-semibold">{event.eventName}</h3>
              <p className="text-gray-700">{event.eventDescription}</p>
              <p className="text-gray-700">Location: {event.eventLocation}</p>
              <p className="text-gray-700">Expires at: {event.eventExpiry}</p>
              <p className="text-gray-700">Color: {event.eventColor}</p>
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleEdit(event)}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
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
