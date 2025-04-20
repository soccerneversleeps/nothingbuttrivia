import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    // Log the API key (first few characters only)
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    console.log('API Key check:', {
      exists: !!apiKey,
      length: apiKey.length,
      prefix: apiKey.substring(0, 5)
    });

    // Initialize the model
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Simple test prompt
    const result = await model.generateContent("Say 'Hello! I am working!'");
    const response = await result.response;
    
    return NextResponse.json({
      success: true,
      message: response.text(),
      debug: {
        apiKeyConfigured: !!apiKey,
        apiKeyLength: apiKey.length,
        apiKeyPrefix: apiKey.substring(0, 5)
      }
    });
  } catch (error: any) {
    console.error('Gemini Test Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      debug: {
        apiKeyConfigured: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        errorType: error.name,
        errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }, { status: 500 });
  }
} 