'use client'
import React from 'react';
import Modal from 'react-modal';
import Image from 'next/image';
import { useEventForm, FormData } from './useEventForm';
import { v4 as uuidv4 } from 'uuid'; // Import UUID v4
import { useState } from 'react';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  initialData?: FormData | null;
  creatorName: string;
}

const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { formData, handleChange, handleSubmit } = useEventForm({ initialData, onSubmit });
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Event Form"
      style={{
        content: {
          maxWidth: '70%',
          maxHeight: '80%',
          margin: 'auto',
          border: 'none',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          borderRadius: '8px',
          overflow: 'auto',
          padding: '20px',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      <div style={{ textAlign: 'right' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <Image src="/close-icon.svg" alt="Close Icon" width={20} height={20} />
        </button>
      </div>

      <div className="flex flex-col justify-center items-center">
        <h2>{initialData ? 'Edit Event' : 'Create Event'}</h2>
        <form className="flex flex-col justify-center items-center gap-2" onSubmit={handleSubmit} style={{ width: '100%' }}>
          <input type="hidden" id="_id" name="_id" value={formData.event_id || ''} />

          <label htmlFor="eventName">Event Name:</label>
          <input
            type="text"
            id="eventName"
            name="eventName"
            value={formData.eventName}
            onChange={handleChange}
            required
          />

          <label htmlFor="eventLocation">Event Location:</label>
          <input
            type="text"
            id="eventLocation"
            name="eventLocation"
            value={formData.eventLocation}
            onChange={handleChange}
            required
          />

          <label htmlFor="eventExpiry">Event Expiry:</label>
          <input
            type="date"
            id="eventExpiry"
            name="eventExpiry"
            value={formData.eventExpiry}
            onChange={handleChange}
            min={today} // Prevent selection of past dates
            required
          />

          <label htmlFor="eventTime">Event Time:</label>
          <input
            type="time"
            id="eventTime"
            name="eventTime"
            value={formData.eventTime}
            onChange={handleChange}
            required
          />

          <label htmlFor="eventDescription">Event Description:</label>
          <textarea
            id="eventDescription"
            name="eventDescription"
            value={formData.eventDescription}
            onChange={handleChange}
            required
          />

          <label htmlFor="eventColor">Event Color:</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="radio"
              id="purple"
              name="eventColor"
              value="purple"
              checked={formData.eventColor === 'purple'}
              onChange={handleChange}
              style={{ marginRight: '5px' }}
            />
            <label htmlFor="purple" style={{ marginRight: '15px' }}>
              <span style={{ backgroundColor: 'purple', width: '20px', height: '20px', display: 'inline-block', borderRadius: '50%' }}></span>
            </label>

            <input
              type="radio"
              id="green"
              name="eventColor"
              value="green"
              checked={formData.eventColor === 'green'}
              onChange={handleChange}
              style={{ marginRight: '5px' }}
            />
            <label htmlFor="green" style={{ marginRight: '15px' }}>
              <span style={{ backgroundColor: 'green', width: '20px', height: '20px', display: 'inline-block', borderRadius: '50%' }}></span>
            </label>

            <input
              type="radio"
              id="red"
              name="eventColor"
              value="red"
              checked={formData.eventColor === 'red'}
              onChange={handleChange}
              style={{ marginRight: '5px' }}
            />
            <label htmlFor="red">
              <span style={{ backgroundColor: 'red', width: '20px', height: '20px', display: 'inline-block', borderRadius: '50%' }}></span>
            </label>
          </div>

          {/* Display creator's name if available */}
          {creatorName !== undefined && creatorName !== null && (
            <div>
              <h3>Created by: {creatorName}</h3>
            </div>
          )}

          <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md">
            {initialData ? 'Update Event' : 'Create Event'}
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default EventFormModal;
