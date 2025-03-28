import express, { Router } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { makeGroqApiCall } from "./api";
import { FetchQuestionsRequest, Question } from "@shared/types";
import { z } from "zod";

const validateQuizRequestSchema = z.object({
  topic: z.string().min(1),
  count: z.number().min(1).max(10).default(5),
});

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = Router();
  
  // Route to fetch quiz questions for a specific topic
  apiRouter.post("/quiz/questions", async (req, res) => {
    try {
      console.log("Received quiz questions request:", req.body);
      
      // Validate request body
      const validationResult = validateQuizRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        console.error("Validation error:", validationResult.error.errors);
        return res.status(400).json({ 
          message: "Invalid request",
          errors: validationResult.error.errors 
        });
      }

      const { topic, count } = validationResult.data;
      console.log(`Fetching ${count} questions for topic: ${topic}`);
      
      // Make API call to Groq (LLaMA 3)
      const questions = await makeGroqApiCall(topic, count);
      console.log(`Successfully fetched ${questions.length} questions`);
      
      return res.json({
        topic,
        questions,
      });
    } catch (error: any) {
      console.error("Error fetching quiz questions:", error);
      // Return more detailed error message
      return res.status(500).json({ 
        message: "Failed to fetch quiz questions",
        error: error.message || "Unknown error"
      });
    }
  });

  // Register API routes
  app.use("/api", express.json(), apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
