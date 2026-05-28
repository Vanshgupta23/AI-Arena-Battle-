import dotenv from 'dotenv';

dotenv.config();

 const config = {
  googleApiKey: process.env.GOOGLE_API_KEY || '',
  mistralApiKey: process.env.MISTRAL_API_KEY || '',
    cohereApiKey: process.env.COHERE_API_KEY || '',
};

export default config ;