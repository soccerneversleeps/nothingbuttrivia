// @ts-ignore
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = require("firebase/firestore");
const OpenAI = require('openai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.openai.com/v1",
  dangerouslyAllowBrowser: true
});

interface QuestionData {
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: number;
  usageCount: number;
  lastUsed: null;
  createdAt: Date;
  id?: string; // Added for existing questions
}

interface QuestionCache {
  [key: string]: {
    questions: QuestionData[];
    embeddings: number[][];
  };
}

const questionCache: QuestionCache = {};

const sports = ['basketball', 'football', 'baseball', 'soccer'];
const questionsPerDifficulty = 150;

// Updated point values to match game structure
const getPointValues = (sport: string) => {
  switch (sport.toLowerCase()) {
    case 'basketball':
      return {
        easy: 2,  // 2-pointer
        hard: 3   // 3-pointer
      };
    case 'football':
      return {
        easy: 3,  // Field goal
        hard: 6   // Touchdown
      };
    case 'baseball':
      return {
        easy: 1,  // Single
        medium: 2, // Double
        hard: 3,   // Triple
        expert: 4  // Home run
      };
    case 'soccer':
      return {
        easy: 1,  // Goal
        hard: 1   // Goal
      };
    default:
      return {
        easy: 1,
        hard: 1
      };
  }
};

// Function to get difficulty description
const getDifficultyDescription = (sport: string, points: number): string => {
  switch (sport.toLowerCase()) {
    case 'football':
      return points === 6 ? 'Touchdown' : 'Field Goal';
    case 'soccer':
      return 'Goal';
    case 'baseball':
      switch (points) {
        case 1: return 'Single';
        case 2: return 'Double';
        case 3: return 'Triple';
        case 4: return 'Home Run';
        default: return 'Hit';
      }
    case 'basketball':
      return points === 3 ? '3 Pointer' : '2 Pointer';
    default:
      return `${points} Points`;
  }
};

// Function to get embedding for a question
async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

// Function to calculate cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Function to check if a question is semantically unique
async function isQuestionUnique(sport: string, newQuestion: QuestionData): Promise<boolean> {
  // Temporarily disable duplicate checking
  return true;
}

// Function to analyze and clean up existing questions
async function cleanupExistingQuestions(sport?: string) {
  // Disable cleanup
  return;
}

const generateQuestion = async (sport: string, points: number): Promise<QuestionData | null> => {
  try {
    const difficultyDescription = getDifficultyDescription(sport, points);
    const prompt = `Create a ${difficultyDescription} ${sport} trivia question.
    
    Guidelines for ${difficultyDescription} questions:
    ${getDifficultyGuidelines(sport, points)}
    
    ENSURE the question matches these criteria:
    1. Appropriate difficulty level
    2. Clear and unambiguous
    3. All options are plausible but only one is correct
    4. Avoid extremely obscure facts or statistics
    5. Focus on interesting and engaging content
    6. Try to avoid questions about the same topic as previous questions
    
    Format the response EXACTLY as this JSON:
    {
      "text": "The question text here?",
      "options": ["First option", "Second option", "Third option", "Fourth option"],
      "correctAnswer": "The correct option (must match one of the options exactly)",
      "explanation": "Brief explanation of why this is correct"
    }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        { 
          role: "system", 
          content: "You are a sports trivia expert creating engaging questions for casual to regular fans. Questions should be interesting and educational but not overly difficult. Try to vary the topics and avoid repeating similar questions." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.9,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) return null;

    const parsedContent = JSON.parse(content);
    
    const questionData: QuestionData = {
      ...parsedContent,
      category: sport,
      difficulty: points,
      usageCount: 0,
      lastUsed: null,
      createdAt: new Date()
    };

    return questionData;
  } catch (error: any) {
    console.error('Error generating question:', error);
    return null;
  }
};

const getDifficultyGuidelines = (sport: string, points: number): string => {
  switch (sport.toLowerCase()) {
    case 'basketball':
      return points === 2 
        ? '- Basic facts, well-known current players, simple rules, recent championships. Questions should be answerable by casual fans.'
        : '- Historical facts, team records, famous plays, strategic aspects. Questions should be challenging but still answerable by regular fans.';
    case 'football':
      return points === 3 
        ? '- Basic rules, current players, recent games, simple strategies. Questions should be answerable by casual fans.'
        : '- Historical plays, team records, complex strategies, famous moments. Questions should be challenging but still answerable by regular fans.';
    case 'baseball':
      switch (points) {
        case 1: return '- Very basic facts, current players, simple rules. Questions should be answerable by anyone with basic baseball knowledge.';
        case 2: return '- Basic facts, well-known players, simple rules, recent events. Questions should be answerable by casual fans.';
        case 3: return '- Historical facts, team records, famous plays. Questions should be challenging but still answerable by regular fans.';
        case 4: return '- Complex strategies, historical records, famous moments, detailed rules. Questions should be challenging but still answerable by dedicated fans.';
        default: return '';
      }
    case 'soccer':
      return '- Basic facts, well-known players, simple rules, recent championships. Questions should be answerable by casual fans.';
    default:
      return '';
  }
};

async function countQuestionsForSportAndDifficulty(sport: string, points: number): Promise<number> {
  const questionsSnapshot = await getDocs(collection(db, "preloaded_questions"));
  let count = 0;
  questionsSnapshot.forEach((doc: any) => {
    const question = doc.data() as QuestionData;
    if (question.category.toLowerCase() === sport.toLowerCase() && question.difficulty === points) {
      count++;
    }
  });
  return count;
}

const generateQuestionsForSport = async (sport: string): Promise<number> => {
  const pointValues = getPointValues(sport);
  const difficulties = Object.entries(pointValues);
  let totalGenerated = 0;
  
  // Only analyze questions for the specified sport
  await cleanupExistingQuestions(sport);
  
  for (const [difficulty, points] of difficulties) {
    const currentCount = await countQuestionsForSportAndDifficulty(sport, points);
    const questionsNeeded = questionsPerDifficulty - currentCount;
    
    if (questionsNeeded > 0) {
      console.log(`\nGenerating ${questionsNeeded} ${getDifficultyDescription(sport, points)} questions for ${sport}...`);
      let generatedCount = 0;
      let attempts = 0;
      const maxAttempts = questionsNeeded * 3; // Allow for some failures
      
      while (generatedCount < questionsNeeded && attempts < maxAttempts) {
        const question = await generateQuestion(sport, points);
        if (question) {
          await addDoc(collection(db, "preloaded_questions"), question);
          generatedCount++;
          totalGenerated++;
          console.log(`[${sport}][${getDifficultyDescription(sport, points)}] Generated question ${generatedCount}/${questionsNeeded} (Total: ${currentCount + generatedCount})`);
          
          // Add a delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        attempts++;
      }
      
      if (generatedCount < questionsNeeded) {
        console.log(`Warning: Only generated ${generatedCount} out of ${questionsNeeded} needed questions for ${sport} ${getDifficultyDescription(sport, points)}`);
      }
    }
  }
  
  return totalGenerated;
};

const generateAllQuestions = async () => {
  // First clean up existing questions
  await cleanupExistingQuestions();
  
  let grandTotal = 0;
  for (const sport of sports) {
    console.log(`Starting question generation for ${sport}...`);
    const sportTotal = await generateQuestionsForSport(sport);
    grandTotal += sportTotal || 0;
    console.log(`Completed question generation for ${sport}. Generated ${sportTotal} questions.`);
  }
  console.log(`All questions generated! Total questions created: ${grandTotal}`);
};

// Function to count existing questions
async function countExistingQuestions() {
  console.log("\nCounting questions in database...");
  const questionsSnapshot = await getDocs(collection(db, "preloaded_questions"));
  const questions: QuestionData[] = [];
  
  questionsSnapshot.forEach((doc: any) => {
    const question = doc.data() as QuestionData;
    questions.push(question);
  });

  // Group questions by sport and difficulty
  const counts: { [key: string]: { [key: string]: number } } = {};
  for (const sport of sports) {
    const pointValues = getPointValues(sport);
    counts[sport] = {};
    for (const [key, value] of Object.entries(pointValues)) {
      counts[sport][`${getDifficultyDescription(sport, value)}`] = 0;
    }
  }

  // Count questions
  for (const question of questions) {
    const sport = question.category;
    const pointValues = getPointValues(sport);
    const pointType = getDifficultyDescription(sport, question.difficulty);
    if (counts[sport]) {
      counts[sport][pointType] = (counts[sport][pointType] || 0) + 1;
    }
  }

  // Display counts in a compact format
  console.log("\nQuestion Counts:");
  console.log("----------------");
  for (const sport of sports) {
    const total = Object.values(counts[sport]).reduce((sum, count) => sum + count, 0);
    console.log(`\n${sport.toUpperCase()}: ${total} total`);
    for (const [type, count] of Object.entries(counts[sport])) {
      console.log(`  ${type}: ${count} questions`);
    }
  }

  const totalQuestions = Object.values(counts).reduce(
    (sum, sportCounts) => sum + Object.values(sportCounts).reduce((s, c) => s + c, 0), 
    0
  );
  console.log("\nTOTAL QUESTIONS:", totalQuestions);
}

// Main execution
const args = process.argv.slice(2);
if (args.includes('--count-only')) {
  countExistingQuestions()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error counting questions:', error);
      process.exit(1);
    });
} else {
  generateAllQuestions()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error generating questions:', error);
      process.exit(1);
    });
}

// Export the functions
module.exports = {
  generateQuestion,
  generateAllQuestions
}; 