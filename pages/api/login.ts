import type { NextApiRequest, NextApiResponse } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const supabase = createPagesServerClient({ req, res });

    const { username, password } = req.body;

    const {
      data: { session, user },
      error,
    } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    });

    if (error || !session) {
      console.error(error?.message || 'No session returned');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.status(200).json({ message: 'Login successful', user });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
