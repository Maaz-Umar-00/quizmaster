import { makeGroqApiCall } from './api';

// Log a more detailed error message to help debug
async function testGroqCall() {
  try {
    console.log("Testing Groq API connection...");
    console.log("API key present:", !!process.env.GROQ_API_KEY);
    console.log("API key length:", process.env.GROQ_API_KEY?.length || 0);
    const questions = await makeGroqApiCall("science", 1);
    console.log("API call successful:", questions.length > 0);
    console.log("First question:", JSON.stringify(questions[0], null, 2));
    return true;
  } catch (error: any) {
    console.error("Error details:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Execute test
testGroqCall().then(success => {
  console.log("Test completed. Success:", success);
  process.exit(success ? 0 : 1);
});