import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const generateTranscript = async (audioUrl) => {
    try {
        const transcript = await openai.audio.transcriptions.create({
            file: audioUrl,
            model: "whisper-1",
        });
        return transcript.text;
    } catch (error) {
        console.error("Error generating transcript:", error);
        throw error;
    }
};

export const generateSummary = async (transcript) => {
    try {
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an expert educational content summarizer. Create a concise but comprehensive summary of the following transcript."
                },
                {
                    role: "user",
                    content: transcript
                }
            ],
            max_tokens: 500
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error generating summary:", error);
        throw error;
    }
};

export const generateChapters = async (transcript, videoDuration) => {
    try {
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Analyze this transcript and break it into logical chapters. For each chapter, provide a title, start time, end time, and brief summary. Format as JSON array."
                },
                {
                    role: "user",
                    content: `Transcript: ${transcript}\nVideo Duration: ${videoDuration} seconds`
                }
            ],
            response_format: { type: "json_object" }
        });
        return JSON.parse(response.choices[0].message.content).chapters;
    } catch (error) {
        console.error("Error generating chapters:", error);
        throw error;
    }
};

export const generateQuiz = async (transcript) => {
    try {
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Create a quiz based on this educational content. Generate multiple choice questions with explanations. Format as JSON array."
                },
                {
                    role: "user",
                    content: transcript
                }
            ],
            response_format: { type: "json_object" }
        });
        return JSON.parse(response.choices[0].message.content).questions;
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw error;
    }
};

export const generateKeywords = async (transcript) => {
    try {
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Extract key topics and concepts from this content as keywords. Return as JSON array."
                },
                {
                    role: "user",
                    content: transcript
                }
            ],
            response_format: { type: "json_object" }
        });
        return JSON.parse(response.choices[0].message.content).keywords;
    } catch (error) {
        console.error("Error generating keywords:", error);
        throw error;
    }
};

export const chatWithAI = async (messages, context) => {
    try {
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are an educational AI assistant helping with content related to: ${context}`
                },
                ...messages
            ]
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error in AI chat:", error);
        throw error;
    }
}; 