import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface FormData {
  event_id: string; // Ensure it's _id for MongoDB compatibility
  eventName: string;
  eventLocation: string;
  eventExpiry: string;
  eventDescription: string;
  eventColor: string;
}

interface UseEventFormProps {
  initialData?: FormData | null;
  onSubmit: (formData: FormData) => void;
}

export const useEventForm = ({ initialData, onSubmit }: UseEventFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    event_id: '', // Initialize event_id as an empty string
    eventName: '',
    eventLocation: '',
    eventExpiry: '',
    eventDescription: '',
    eventColor: 'purple',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData); // Set initial data if provided
    } else {
      resetForm(); // Reset form if initialData is null or undefined
    }
  }, [initialData]);

  const resetForm = () => {
    setFormData({
      event_id: '',
      eventName: '',
      eventLocation: '',
      eventExpiry: '',
      eventDescription: '',
      eventColor: 'purple',
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.event_id) {
      formData.event_id = uuidv4(); // Generate _id if not present
    }
    console.log("Form Data Submitted:", formData);
    onSubmit(formData); // Call onSubmit function with form data
    resetForm(); // Reset form after submission
  };

  return {
    formData,
    handleChange,
    handleSubmit,
  };
};
