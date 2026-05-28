export const generateTitle = (message) => {
  if (!message || message.trim() === '') return "New Chat";
  
  // Remove common filler words and non-alphanumeric at start/end
  const fillerWords = new Set(['how', 'what', 'please', 'can', 'you', 'explain', 'tell', 'me', 'the', 'a', 'an', 'is', 'are']);
  const words = message
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0 && !fillerWords.has(word.toLowerCase()));

  if (words.length === 0) return "New Chat";

  // Take first 3 meaningful words and capitalize properly
  const titleWords = words.slice(0, 3).map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );

  return titleWords.join(' ');
};
