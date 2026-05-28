import {ChatGoogle} from '@langchain/google';
import { ChatMistralAI } from '@langchain/mistralai';
import { ChatCohere } from '@langchain/cohere';
import config from '../config/config';

// export const geminiModel = new ChatGoogle({
//     model:"gemini-flash-latest",
//     apiKey:config.googleApiKey,
// })

// export const mistralAiModel = new ChatMistralAI({
//     model:"mistral-medium-latest",
//     apiKey:config.mistralApiKey,
// })

// export const cohereModel = new ChatCohere({
//     model:"command-r-plus",
//     apiKey:config.cohereApiKey,
// })
export const geminiModel = new ChatGoogle({
  model: "gemini-flash-latest",
  apiKey: config.googleApiKey,
});

// ✅ Fighter 2 (LIGHT)
export const mistralAiModel = new ChatMistralAI({
  model: "mistral-medium-latest",
  apiKey: config.mistralApiKey,
});

// ✅ Judge (STABLE)
export const cohereModel = new ChatCohere({
  model: "command-a-03-2025",
  apiKey: config.cohereApiKey,
});
