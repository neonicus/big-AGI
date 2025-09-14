// pages/api/login.js

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    // --- SECURITY NOTE ---
    // In a production application, NEVER hardcode credentials.
    // Use a secure database and password hashing (e.g., bcrypt).
    // This is a simplified example for demonstration purposes.
    const VALID_USERNAME = process.env.AUTH_USERNAME; // Fetched from Vercel Environment Variables
    const VALID_PASSWORD = process.env.AUTH_PASSWORD; // Fetched from Vercel Environment Variables

    if (!VALID_USERNAME || !VALID_PASSWORD) {
        console.error("AUTH_USERNAME and AUTH_PASSWORD environment variables must be set.");
        return res.status(500).json({ message: 'Server configuration error.' });
    }

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      // In a real app, generate a JWT here and return it.
      // For simplicity, we'll just return a success message.
      res.status(200).json({ message: 'Login successful!' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
