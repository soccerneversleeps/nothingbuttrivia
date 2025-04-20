import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface QuestionData {
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: number;
}

interface APIErrorResponse {
  error: string;
  details?: string;
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { category, points } = await request.json();
    console.log('Received request for question:', { category, points });

    if (!category || !points) {
      console.error('Missing required parameters');
      return NextResponse.json<APIErrorResponse>(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('Gemini API key not configured');
      return NextResponse.json<APIErrorResponse>(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are a sports trivia expert specializing in ${category}. 

For basketball:
- 2-point questions should be about fundamental aspects of the game, basic rules, well-known current players, or recent history
- 3-point questions should be about advanced strategies, historical records, specific memorable games, or deep basketball knowledge

For other sports:
- Lower point values (1-2 points) should be easier questions about basic rules, common knowledge, or current events
- Higher point values (3+ points) should be harder questions about historical facts, specific plays/strategies, or deep sport knowledge

Create a ${points}-point ${category} trivia question. The difficulty should match the point value (${points} points = ${points === 2 ? 'moderate' : 'difficult'} difficulty). 
The question must be original and not commonly asked.

Format the response EXACTLY as this JSON:
{
  "text": "The question text here?",
  "options": ["First option", "Second option", "Third option", "Fourth option"],
  "correctAnswer": "The correct option (must match one of the options exactly)",
  "explanation": "Brief explanation of why this is correct",
  "category": "${category}",
  "difficulty": ${points}
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    try {
      const questionData = JSON.parse(content) as QuestionData;
      console.log('Successfully generated question');
      return NextResponse.json<QuestionData>(questionData);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', content);
      throw new Error('Invalid JSON response from Gemini');
    }
  } catch (error) {
    console.error('Error generating question:', error);
    return NextResponse.json<APIErrorResponse>({
      error: 'Failed to generate question',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 