import type { NextApiRequest, NextApiResponse } from 'next'
import supabase

async function signInWithEmail() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'valid.email@supabase.io',
    password: 'example-password',
  })
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const username = req.body.username;
        const password = req.body.password;
        console.log("Username:", username);
        console.log("Password:", password);

        // TODO: Talk to Supabase
        if (1) {
            res.status(200).json({ message: "Login successful" });
        }
    } 
    
    // Login failed
    else {
        res.status(401).json({ message: "Login failed. Please try again" });
    }
}
