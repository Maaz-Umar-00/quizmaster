import axios from "axios";
import { Question } from "@shared/types";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function makeGroqApiCall(topic: string, questionCount: number = 5): Promise<Question[]> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables");
  }
  
  console.log("Using GROQ API with key:", GROQ_API_KEY.substring(0, 5) + "..." + (GROQ_API_KEY.length > 10 ? GROQ_API_KEY.substring(GROQ_API_KEY.length - 5) : ""));
  console.log("Making API call to:", API_URL);

  const headers = {
    "Authorization": `Bearer ${GROQ_API_KEY}`,
    "Content-Type": "application/json"
  };

  // Crafting a detailed prompt to get well-formatted questions
  const prompt = `Generate ${questionCount} multiple-choice quiz questions about ${topic}. 
  For each question, provide exactly 4 answer options with only one correct answer.
  
  Format your response as a valid JSON array with the following structure:
  [
    {
      "text": "Question text goes here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0 // Index of the correct option (0-based)
    },
    // more questions...
  ]
  
  Make sure:
  1. Questions are accurate and appropriate for the topic
  2. Questions are diverse and cover different aspects of the topic
  3. Each question has 4 options, no more, no less
  4. Only one correct answer per question
  5. The response is strictly valid JSON (no explanations outside the array)
  6. Correctness is always precisely and objectively determined
  7. Questions are challenging but not impossibly difficult
  `;

  const data = {
    "model": "llama3-70b-8192",
    "messages": [{ "role": "user", "content": prompt }],
    "temperature": 0.7,
    "response_format": { "type": "json_object" }
  };

  try {
    console.log("Sending request to GROQ API with data:", JSON.stringify(data, null, 2));
    const response = await axios.post(API_URL, data, { headers });
    
    console.log("Received response from GROQ API with status:", response.status);
    
    if (response.status !== 200) {
      console.error("Error from Groq API:", response.data);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const content = response.data.choices[0].message.content;
    
    // Parse the JSON response
    try {
      // The API returns a JSON object, but we need to extract the questions array
      let parsedContent;
      if (typeof content === 'string') {
        parsedContent = JSON.parse(content);
      } else {
        parsedContent = content;
      }
      
      // Extract questions array (could be directly in the response or nested)
      let questions: Question[];
      if (Array.isArray(parsedContent)) {
        questions = parsedContent;
      } else if (parsedContent.questions && Array.isArray(parsedContent.questions)) {
        questions = parsedContent.questions;
      } else {
        // Find any array property in the response
        const arrayProps = Object.keys(parsedContent).filter(key => 
          Array.isArray(parsedContent[key]) && 
          parsedContent[key].length > 0 &&
          parsedContent[key][0].text && 
          parsedContent[key][0].options
        );
        
        if (arrayProps.length > 0) {
          questions = parsedContent[arrayProps[0]];
        } else {
          throw new Error("Could not find questions array in API response");
        }
      }
      
      // Validate the questions format
      questions = questions.map(q => ({
        text: q.text,
        options: q.options.slice(0, 4), // Ensure exactly 4 options
        correctAnswer: q.correctAnswer
      }));
      
      return questions;
    } catch (parseError) {
      console.error("Error parsing API response:", parseError);
      console.error("Raw response:", content);
      throw new Error("Failed to parse API response");
    }
  } catch (error: any) {
    console.error("Error calling Groq API:", error);
    
    // Enhanced error details
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error Response Data:", error.response.data);
      console.error("Error Response Status:", error.response.status);
      console.error("Error Response Headers:", error.response.headers);
      throw new Error(`GROQ API Error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from GROQ API. Check network connectivity.");
      throw new Error("No response received from GROQ API. Check network connectivity.");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up request:", error.message);
      throw new Error(`Error setting up GROQ API request: ${error.message}`);
    }
  }
}
