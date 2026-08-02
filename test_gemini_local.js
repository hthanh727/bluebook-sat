const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ override: true });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

const word = 'sidewalk';
const prompt = \
Act as a dictionary API. The user is asking for the definition of the word or phrase: "\".
Even if it is a phrase or a conjugated word, you MUST provide a definition for it in the context of standard English.
Return a JSON array containing exactly one object with the following structure:
[
  {
    "word": "\",
    "meanings": [
      {
        "partOfSpeech": "phrase",
        "definitions": [
          {
            "definition": "The definition goes here."
          }
        ]
      }
    ]
  }
]
Return ONLY the JSON array, no markdown formatting, no backticks.
\;

model.generateContent(prompt).then(r => console.log('RESPONSE:', r.response.text())).catch(e => console.error('ERROR:', e));
