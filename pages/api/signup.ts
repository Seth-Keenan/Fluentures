import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/app/lib/hooks/supabaseAdminClient'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { username, password, name } = req.body;

        // 1. Signup user to supabase
        const {
            data: { user },
            error,
        } = await supabase.auth.signUp({
            email: username,
            password,
        });

        const userId = user?.id;

        // 2. Insert user into Users table
        const { error: dbError } = await supabase.from('Users').insert([
            {
                user_id: userId,
                username: username,
                fname: name
                // avatar_url, not sure how to handle this atm
            },
        ]);

        // S-tier error handling
        if (error) {
            console.error(error?.message);
            return res.status(401).json({ message: error?.message });
        }
        else if (dbError) {
            console.error(dbError.message);
            return res.status(401).json({ message: dbError.message });
        }
        else {
            console.log("User added succesfully!")
            return res.status(200).json({ message: "Signup successful" });
        }
    }

    res.status(405).json({ message: "Method not allowed" });
}
