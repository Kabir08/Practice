import axios from 'axios';

export const generateDescription = async (eventName: string | undefined, eventLocation: string | undefined) => {
  console.log('Generating description with:', { eventName, eventLocation });

  try {
    const response = await axios.post('/api/llamaClient', {
      title: eventName || "undefined",
      location: eventLocation || "undefined",
    });

    console.log('API response:', response.data);

    if (response.data.description) {
      return response.data.description;
    } else {
      throw new Error('Failed to generate description');
    }
  } catch (error) {
    console.error('Error in generateDescription:', error);
    throw error;
  }
};
