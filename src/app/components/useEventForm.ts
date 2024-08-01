import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

export interface FormData {
  event_id: string; // Ensure it's _id for MongoDB compatibility
  eventName: string;
  eventLocation: string;
  eventExpiry: string; // Use ISO string for date and time
  eventDescription: string;
  creatorName: string;
  addedByUser?: string; // Optional field

}

interface UseEventFormProps {
  initialData?: FormData | null;
  onSubmit: (formData: FormData) => void;
}

interface Suggestion {
  place_id: string;
  display_name: string;
}

const fetchSuggestions = async (query: string): Promise<Suggestion[]> => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
  );
  const data = await response.json();
  return data.map((item: any) => ({
    place_id: item.place_id,
    display_name: item.display_name,
  }));
};

export const useEventForm = ({ initialData, onSubmit }: UseEventFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    event_id: '', // Initialize event_id as an empty string
    eventName: '',
    eventLocation: '',
    eventExpiry: moment().toISOString(),
    eventDescription: '',
    creatorName: '',
    addedByUser: '', // Initialize as empty string
  });

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

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
      eventExpiry: moment().toISOString(), 
      eventDescription: '',
      creatorName: '',
      addedByUser: '', // Add this line to reset addedByUser

    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    handleChange(event);

    if (value.length > 2) {
      const data = await fetchSuggestions(value);
      setSuggestions(data);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    const mockEvent = {
      target: {
        name: 'eventLocation',
        value: suggestion.display_name,
      },
    } as unknown as ChangeEvent<HTMLInputElement>;

    handleChange(mockEvent);
    setSuggestions([]);
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const date = moment(e.target.value);
    const currentDate = moment();
    if (date.isBefore(currentDate, 'day')) {
      alert("Date cannot be set to a past date.");
      return;
    }
    const time = moment(formData.eventExpiry).format('HH:mm');
    const eventExpiry = date.set({ hour: parseInt(time.split(':')[0]), minute: parseInt(time.split(':')[1]) }).toISOString();
    handleChange({ target: { name: 'eventExpiry', value: eventExpiry } } as ChangeEvent<HTMLInputElement>);
  };

  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const time = moment(e.target.value, 'HH:mm');
    const currentExpiry = moment(formData.eventExpiry);
    if (time.isBefore(moment(currentExpiry).startOf('day'))) {
      alert("Time cannot be set to a past time.");
      return;
    }
    const eventExpiry = currentExpiry.set({ hour: time.hour(), minute: time.minute() }).toISOString();
    handleChange({ target: { name: 'eventExpiry', value: eventExpiry } } as ChangeEvent<HTMLInputElement>);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.event_id) {
      formData.event_id = uuidv4(); // Generate _id if not present
    }

    const updatedFormData = {
      ...formData,
    };

    console.log("Form Data Submitted:", updatedFormData);
    onSubmit(updatedFormData); // Call onSubmit function with updated form data
    resetForm(); // Reset form after submission
  };

  return {
    formData,
    handleChange,
    handleInputChange,
    handleSuggestionClick,
    handleDateChange,
    handleTimeChange,
    handleSubmit,
    suggestions,
  };
};
