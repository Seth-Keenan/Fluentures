import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../app/lib/hooks/supabaseClient' 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email: username,
      password: password,
    });

    if (error) {
      console.error(error.message);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.status(200).json({ message: "Login successful", data });
  }

  res.status(405).json({ message: "Method not allowed" });
}
