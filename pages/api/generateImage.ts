// This is a placeholder for Next.js API route types.
// In a real Next.js project, you would import these from 'next'.
type NextApiRequest = any;
type NextApiResponse = any;

const EXTERNAL_API_URL = 'https://meechain-ai-image-editor-975552965891.us-west1.run.app/generate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { prompt } = req.body;
    const apiKey = process.env.API_KEY; // Securely access API key on the server

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!apiKey) {
        console.error("API_KEY environment variable not set on the server.");
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    try {
        const externalApiResponse = await fetch(EXTERNAL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, apiKey }),
        });

        if (!externalApiResponse.ok) {
            const errorText = await externalApiResponse.text();
            console.error('External API error:', errorText);
            return res.status(externalApiResponse.status).json({ error: 'Failed to generate image from external service.' });
        }

        const data = await externalApiResponse.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error('Error proxying image generation request:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
