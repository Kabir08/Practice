import connectDB from './mongoose'
import User from './models/User'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
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