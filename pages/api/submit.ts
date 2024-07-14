import connectDB from '@/app/api/mongoose'
import User from '@/app/api/models/User'
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
    console.log('Received request:', req.method, req.body);
    await connectDB();

    if(req.method === 'POST'){
        try{
            const{
                username,
                avatar,
                paymentId,
                paymentSecret,
                instagram,
                linkedin,
                github
            } = req.body

            const newUser  = new User({
                username,
                avatar,
                paymentId,
                paymentSecret,
                instagram,
                linkedin,
                github,
            });

            await newUser.save()

            res.status(201).json({message: 'User data saved successfully.'});
        } catch(error){
            console.error('Error saving user:',error);
            res.status(500).json({error: 'Failed to save user data.'})
        }
    } else{
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}