import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface FormData {
  id?: string; // Add id as an optional field
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
    eventName: '',
    eventLocation: '',
    eventExpiry: '',
    eventDescription: '',
    eventColor: 'purple',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setFormData({
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
    if (!formData.id) {
      formData.id = uuidv4(); // Generate UUID for new event
    }
    onSubmit(formData);
    resetForm();
  };

  return {
    formData,
    handleChange,
    handleSubmit,
  };
};
