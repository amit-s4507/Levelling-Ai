import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const generateTranscript = async (videoFile) => {
  try {
    // This is a placeholder. In reality, you would use OpenAI's Whisper API or similar
    // to generate transcript from video file
    logger.info(`Generating transcript for video: ${videoFile}`);
    return "Sample transcript content";
  } catch (error) {
    logger.error("Error generating transcript:", error);
    throw error;
  }
};

export const generateSummary = async (transcript) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at summarizing educational content. Create a concise but comprehensive summary."
        },
        {
          role: "user",
          content: `Please summarize the following transcript:\n\n${transcript}`
        }
      ],
      max_tokens: 500
    });

    return response.choices[0].message.content;
  } catch (error) {
    logger.error("Error generating summary:", error);
    throw error;
  }
};

export const detectChapters = async (transcript) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at organizing educational content into logical chapters. Return the response as a JSON array of objects with title and timestamp."
        },
        {
          role: "user",
          content: `Please identify main chapters/sections from this transcript with timestamps:\n\n${transcript}`
        }
      ],
      max_tokens: 500
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    logger.error("Error detecting chapters:", error);
    throw error;
  }
};

export const generateQuiz = async (transcript) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating educational assessments. Create multiple choice questions that test understanding of key concepts."
        },
        {
          role: "user",
          content: `Please generate a quiz based on this transcript:\n\n${transcript}`
        }
      ],
      max_tokens: 1000
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    logger.error("Error generating quiz:", error);
    throw error;
  }
};

export const extractKeywords = async (transcript) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Extract key technical terms and concepts as a JSON array."
        },
        {
          role: "user",
          content: `Please extract important keywords from this transcript:\n\n${transcript}`
        }
      ],
      max_tokens: 300
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    logger.error("Error extracting keywords:", error);
    throw error;
  }
};

export const generateLearningObjectives = async (transcript) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating learning objectives. Return response as a JSON array."
        },
        {
          role: "user",
          content: `Please generate learning objectives based on this transcript:\n\n${transcript}`
        }
      ],
      max_tokens: 500
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    logger.error("Error generating learning objectives:", error);
    throw error;
  }
};

export const answerQuestion = async (question, context) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI tutor. Answer questions based on the provided context."
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion: ${question}`
        }
      ],
      max_tokens: 500
    });

    return response.choices[0].message.content;
  } catch (error) {
    logger.error("Error answering question:", error);
    throw error;
  }
};

export const generateLearningPlan = async (transcript, summary, learningObjectives) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert educational planner. Create a personalized learning plan based on the content."
        },
        {
          role: "user",
          content: `Please generate a personalized learning plan based on:\n\nTranscript: ${transcript}\n\nSummary: ${summary}\n\nLearning Objectives: ${JSON.stringify(learningObjectives)}`
        }
      ],
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    logger.error("Error generating learning plan:", error);
    throw error;
  }
}; 