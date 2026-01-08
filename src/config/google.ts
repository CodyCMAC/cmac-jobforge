// Google API Configuration
// Uses environment variables - set these in your .env file

export const GOOGLE_CONFIG = {
  // OAuth 2.0 Client ID (for Google Sign-In and Calendar access)
  // Set via VITE_GOOGLE_CLIENT_ID environment variable
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
  
  // API Key (for public calendar access)
  // Set via VITE_GOOGLE_API_KEY environment variable
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY || "",
  
  // Scopes needed for Google Calendar
  scopes: [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.events.readonly",
  ].join(" "),
};
