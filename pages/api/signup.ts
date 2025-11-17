import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/app/lib/hooks/supabaseAdminClient'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { username, password, name, social_username } = req.body;

        // Normalize/clean social username and require it
        const socialClean = social_username ? String(social_username).trim().replace(/^@+/, "") : "";
        if (!socialClean) {
            return res.status(400).json({ message: "Social username is required" });
        }

        // 0. Check uniqueness for social username
        const { data: existingRows, error: checkErr } = await supabase
            .from('Users')
            .select('user_id')
            .eq('social_username', socialClean)
            .limit(1);

        if (checkErr) {
            console.error('Error checking social username uniqueness:', checkErr.message);
            return res.status(500).json({ message: 'Error checking social username' });
        }

        if (existingRows && existingRows.length > 0) {
            return res.status(409).json({ message: 'Social username already taken' });
        }

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
                fname: name,
                social_username: socialClean || null
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
            // If a race caused duplicate constraint, return conflict
            return res.status(409).json({ message: dbError.message });
        }
        else {
            console.log("User added succesfully!")
            return res.status(200).json({ message: "Signup successful" });
        }
    }

    res.status(405).json({ message: "Method not allowed" });
}
