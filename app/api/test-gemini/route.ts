import { NextResponse } from 'next/server';
import { testGemini } from '@/lib/geminiService';

export async function GET() {
  try {
    const result = await testGemini();
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      apiKeyConfigured: !!process.env.GEMINI_API_KEY
    });
  } catch (error: any) {
    console.error('Gemini Test Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      apiKeyConfigured: !!process.env.GEMINI_API_KEY
    }, { status: 500 });
  }
} 