'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from "@auth0/nextjs-auth0/client";

const CreatedEventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const { user, error, isLoading } = useUser();

  const fetchEvents = useCallback(async () => {
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
  }, [user?.name]); // Added user?.name as a dependency

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]); // Updated the dependency array

  if (isLoading) return <div>Loading.....</div>;
  if (error) return <div>{error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Created Events</h2>
        <ul className="space-y-2">
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
      </div>
    </div>
  );
};

export default CreatedEventsPage;
