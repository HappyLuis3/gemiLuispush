import express from 'express';
import { gemini_api_call } from './script_/gemini_api_call.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/gemini', async (req, res) => {
    try {
        const { userQuery } = req.body;

        if (!userQuery) {
            return res.status(400).send('No query provided');
        }

        // Call your Gemini API function, which currently returns a JSON string
        const jsonStringFromGemini = await gemini_api_call(userQuery);

        // --- IMPORTANT CHANGE HERE: Parse the JSON string into a JavaScript object ---
        let responseFromGemini;
        try {
            responseFromGemini = JSON.parse(jsonStringFromGemini);
        } catch (parseError) {
            console.error('Error parsing JSON string from gemini_api_call:', parseError);
            // If it fails to parse, perhaps it was already an object or some other format.
            // You might need to handle this case, but for now, assume it's always a string.
            // As a fallback, you could try to use it as is if it's already an object,
            // but the 'Type of responseFromGemini: string' explicitly tells us it's a string.
            return res.status(500).send('Failed to parse Gemini API response on server.');
        }
        // --- END IMPORTANT CHANGE ---

        // Log the parsed object to confirm
        console.log('Parsed response from gemini_api_call:', JSON.stringify(responseFromGemini, null, 2));
        console.log('Type of parsed responseFromGemini:', typeof responseFromGemini);

        // Send the parsed object back to the client
        res.json(responseFromGemini);

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).send('Error processing your request');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});