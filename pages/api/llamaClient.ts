import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const HUGGING_FACE_API_URL = process.env.HUGGING_FACE_API_URL || '';
const HUGGING_FACE_READ_API = process.env.HUGGING_FACE_READ_API || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { title = "undefined", location = "undefined" } = req.body; // Default to "undefined" if not provided

      // Debugging: Log the incoming request data
      console.log('Request body:', { title, location });

      const apiResponse = await axios.post(
        HUGGING_FACE_API_URL,
        {
          inputs: `Generate a description for an event titled "${title}" located at "${location}". Keep it under 20 words.`,
        },
        {
          headers: {
            Authorization: `Bearer ${HUGGING_FACE_READ_API}`,
          },
        }
      );

      // Debugging: Log the API response
      console.log('Hugging Face API response:', apiResponse.data);

      // Assuming the response is an array and you need the first item
      const description = apiResponse.data[0]?.generated_text || "Description could not be generated.";

      res.status(200).json({ description });
    } catch (error) {
      console.error('Error in API handler:', error);
      res.status(500).json({ error: 'Error generating description' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
