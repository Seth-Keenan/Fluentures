import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // const { username, password } = req.body;
    const username = req.body.username;
    const password = req.body.password;
    console.log("Username:", username);
    console.log("Password:", password);
    res.status(200).json({ message: "Credentials received!" });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
