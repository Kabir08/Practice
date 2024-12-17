import React from 'react';
import Modal from 'react-modal';
import Image from 'next/image';
import { useEventForm, FormData } from './useEventForm';
import moment from 'moment';
import { generateDescription } from '../../../utils/llamaService'; // Correct import path

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  initialData?: FormData | null;
  creatorName: string;
}

const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { formData, handleChange, handleInputChange, handleSuggestionClick, handleDateChange, handleTimeChange, handleSubmit, suggestions } = useEventForm({ initialData, onSubmit });
  const today = moment().format('YYYY-MM-DD'); // Get today's date in YYYY-MM-DD format

  // Function to handle AI description generation
  // EventFormModal.tsx
  const handleFormSubmit = async (formData: FormData) => {
    try {
      const response = await fetch('/api/events', {  // Updated to the correct endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit event');
      }

      // Handle success (e.g., show success message or close modal)
      alert('Event created successfully!');
      // Close modal after submission

    } catch (error) {
      console.error('Error submitting event:', error);
      alert('There was an error submitting the event');
    }
  };
const handleAIClick = async () => {
  if (!formData.eventName || !formData.eventLocation) {
    console.warn('Event Name or Event Location is not defined. Cannot generate description.');
    return; // Exit if fields are not populated
  }
  console.log('Form data before generating description:', formData);

  try {
    const newDescription = await generateDescription(formData.eventName, formData.eventLocation);
    console.log('Generated description:', newDescription);

    const syntheticEvent = {
      target: {
        name: 'eventDescription',
        value: newDescription
      }
    } as React.ChangeEvent<HTMLInputElement>; // Cast the object to the correct type
    handleChange(syntheticEvent);
  } catch (error) {
    console.error("Error generating AI description:", error);
  }
};

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
          background: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBA4ZQ-Mx_7tTELpJOrcrp_nMxyppImQc6vQ&s') no-repeat center center`,
          backgroundSize: 'cover',
          color: '#333', // For text color contrast
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
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#444' }}>{initialData ? 'Edit Event' : 'Create Event'}</h2>
        <form className="flex flex-col justify-center items-center gap-2" onSubmit={handleSubmit} style={{ width: '100%' }}>
          <input type="hidden" id="event_id" name="event_id" value={formData.event_id || ''} />

          <label htmlFor="eventName" style={{ fontWeight: 'bold' }}>Event Name:</label>
          <input
            type="text"
            id="eventName"
            name="eventName"
            value={formData.eventName}
            onChange={handleChange}
            required
            style={{ borderRadius: '5px', padding: '8px', border: '1px solid #ddd' }}
          />

          <label htmlFor="eventLocation" style={{ fontWeight: 'bold' }}>Event Location:</label>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              id="eventLocation"
              name="eventLocation"
              value={formData.eventLocation}
              onChange={handleInputChange}
              required
              style={{ borderRadius: '5px', padding: '8px', border: '1px solid #ddd' }}
            />
            {suggestions.length > 0 && (
              <ul className="suggestions-list" style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                width: '100%',
                maxHeight: '150px',
                overflowY: 'auto',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '5px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                zIndex: 1000
              }}>
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.place_id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{
                      padding: '8px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #ddd',
                      backgroundColor: '#fff'
                    }}
                  >
                    {suggestion.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <label htmlFor="eventDate" style={{ fontWeight: 'bold' }}>Event Date:</label>
          <input
            type="date"
            id="eventDate"
            name="eventDate"
            value={moment(formData.eventExpiry).format('YYYY-MM-DD') || today}  // Set value to current date if empty
            onChange={handleDateChange}
            required
            style={{ borderRadius: '5px', padding: '8px', border: '1px solid #ddd' }}
          />

          <label htmlFor="eventTime" style={{ fontWeight: 'bold' }}>Event Time:</label>
          <input
            type="time"
            id="eventTime"
            name="eventTime"
            value={moment(formData.eventExpiry).format('HH:mm') || '00:00'} // Default to '00:00' if empty
            onChange={handleTimeChange}
            required
            style={{ borderRadius: '5px', padding: '8px', border: '1px solid #ddd' }}
          />

          <label htmlFor="eventDescription" style={{ fontWeight: 'bold' }}>Event Description:</label>
          <div style={{ position: 'relative', width: '100%' }}>
            <textarea
              id="eventDescription"
              name="eventDescription"
              value={formData.eventDescription}
              onChange={handleChange}
              required
              style={{ borderRadius: '5px', padding: '8px', border: '1px solid #ddd', height: '100px', width: '100%' }}
            />
            <button
              type="button"
              onClick={handleAIClick}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'orange', color: 'white', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer' }}
            >
              Generate
            </button>
          </div>

          <button
            type="submit"
            style={{ marginTop: '20px', background: 'green', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 20px', cursor: 'pointer' }}
          >
            {initialData ? 'Update Event' : 'Create Event'}
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default EventFormModal;
