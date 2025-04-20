// questionService.ts
import { collection, addDoc, query, where, getDocs, doc, updateDoc, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "./firebase";
import OpenAI from 'openai';

interface QuestionData {
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: number;
}

interface StoredQuestion extends QuestionData {
  id: string;
  usageCount: number;
  lastUsed: Timestamp | Date | null;
  createdAt: Timestamp | Date | null;
}

interface APIErrorResponse {
  error: string;
  details?: string;
}

// Initialize OpenAI with base URL for new API format
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  baseURL: "https://api.openai.com/v1",
  dangerouslyAllowBrowser: true
});

// Get a question for gameplay
export const getQuestion = async (category: string, points: number): Promise<StoredQuestion | null> => {
  try {
    // First, try to get an existing question that hasn't been used much
    const existingQuestion = await getExistingQuestion(category, points);
    if (existingQuestion) {
      return existingQuestion;
    }

    // If no suitable existing question found, generate a new one
    return generateSportsQuestion(category, points);
  } catch (error) {
    console.error("Error getting question:", error);
    return null;
  }
};

// Get an existing question that hasn't been used much recently
const getExistingQuestion = async (category: string, points: number): Promise<StoredQuestion | null> => {
  try {
    // Calculate the date 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // First, query for questions matching category and difficulty
    const q = query(
      collection(db, "questions"),
      where("category", "==", category),
      where("difficulty", "==", points),
      orderBy("usageCount"),
      limit(10)
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }

    // Filter in memory for usage count and last used
    const eligibleQuestions = snapshot.docs
      .map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as StoredQuestion))
      .filter(q => {
        if (!q.lastUsed) return true;
        const lastUsedDate = q.lastUsed instanceof Date ? 
          q.lastUsed : 
          (q.lastUsed instanceof Timestamp ? q.lastUsed.toDate() : new Date(0));
        return q.usageCount < 3 && lastUsedDate < twentyFourHoursAgo;
      })
      .sort((a, b) => {
        // Sort by usage count first
        if (a.usageCount !== b.usageCount) {
          return a.usageCount - b.usageCount;
        }
        // Then by last used date if available
        const aDate = !a.lastUsed ? new Date(0) : 
          (a.lastUsed instanceof Date ? a.lastUsed : 
           (a.lastUsed instanceof Timestamp ? a.lastUsed.toDate() : new Date(0)));
        const bDate = !b.lastUsed ? new Date(0) : 
          (b.lastUsed instanceof Date ? b.lastUsed : 
           (b.lastUsed instanceof Timestamp ? b.lastUsed.toDate() : new Date(0)));
        return aDate.getTime() - bDate.getTime();
      });

    if (eligibleQuestions.length === 0) {
      return null;
    }

    // Get the first eligible question
    const selectedQuestion = eligibleQuestions[0];

    // Update the usage count and last used timestamp
    const now = new Date();
    await updateDoc(doc(db, "questions", selectedQuestion.id), {
      usageCount: (selectedQuestion.usageCount || 0) + 1,
      lastUsed: now
    });

    return {
      ...selectedQuestion,
      lastUsed: now,
      usageCount: (selectedQuestion.usageCount || 0) + 1
    };
  } catch (error) {
    console.error("Error getting existing question:", error);
    return null;
  }
};

const getDifficultyLevel = (category: string, points: number): number => {
  switch (category) {
    case 'football':
      return points === 3 ? 1 : 5; // field goal = 1, touchdown = 5
    case 'soccer':
      return 2; // goal = 2
    case 'baseball':
      switch (points) {
        case 1: return 1; // single = 1
        case 2: return 2; // double = 2
        case 3: return 3; // triple = 3
        case 4: return 5; // grand slam = 5
        default: return 1;
      }
    case 'basketball':
      return points === 2 ? 1 : 4; // 2 pointer = 1, 3 pointer = 4
    default:
      return 1;
  }
};

const getQuestionTypesByDifficulty = (difficulty: number): string[] => {
  if (difficulty <= 2) {
    return [
      "Basic rules that everyone knows (like how many points for a touchdown)",
      "Current superstar players that everyone knows (Tom Brady, LeBron James)",
      "Very famous teams (Lakers, Yankees, Cowboys)",
      "Basic scoring rules",
      "Current championship team",
      "Most basic positions (quarterback, pitcher)",
      "Famous current rivalries",
      "Basic game objectives",
      "Well-known current coaches",
      "Famous current team owners"
    ];
  } else if (difficulty <= 4) {
    return [
      "Recent playoff moments from the last 2-3 years",
      "Popular players from the past 5 years",
      "Basic strategy concepts",
      "Common penalties or rules",
      "Recent championship games",
      "Popular team records",
      "Well-known trades from recent years",
      "Famous current venues",
      "Recent MVP winners",
      "Popular team traditions"
    ];
  } else {
    return [
      "Specific playoff series outcomes",
      "Historical team relocations",
      "Draft pick trades and consequences",
      "Specific record-breaking performances",
      "Conference finals statistics",
      "Coaching strategy details",
      "Player college backgrounds",
      "Complex rule interpretations",
      "Historical team rivalries",
      "Specific game-winning moments"
    ];
  }
};

// Generate a new sports trivia question
const generateSportsQuestion = async (category: string, points: number): Promise<StoredQuestion | null> => {
  try {
    console.log('Generating new question:', { category, points });
    
    if (!category || !points) {
      console.error('Invalid inputs:', { category, points });
      return null;
    }

    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    // Get the last 50 questions for this category to check for similarity and avoid repetition
    const recentQuestionsQuery = query(
      collection(db, "questions"),
      where("category", "==", category),
      limit(50)
    );
    
    const recentQuestionsSnapshot = await getDocs(recentQuestionsQuery);
    const recentQuestions = recentQuestionsSnapshot.docs
      .sort((a, b) => {
        const aData = a.data();
        const bData = b.data();
        const aDate = aData.createdAt instanceof Timestamp ? 
          aData.createdAt.toDate() : 
          (aData.createdAt instanceof Date ? aData.createdAt : new Date(0));
        const bDate = bData.createdAt instanceof Timestamp ? 
          bData.createdAt.toDate() : 
          (bData.createdAt instanceof Date ? bData.createdAt : new Date(0));
        return bDate.getTime() - aDate.getTime();
      })
      .map(doc => doc.data().text.toLowerCase());

    // Define specific question types for football based on point value
    const getFootballQuestionTypes = (points: number) => {
      if (points === 3) { // Field Goal (Easier)
        return [
          "Basic scoring rules (field goals, extra points)",
          "Current star kickers and their teams",
          "Basic football positions",
          "Well-known current teams and their home cities",
          "Basic game rules everyone knows",
          "Famous current quarterbacks",
          "Basic football terminology",
          "Current division leaders",
          "Recent Super Bowl winners",
          "Basic football equipment"
        ];
      } else { // Touchdown (Harder)
        return [
          "Playoff moments from recent seasons",
          "Team strategies and formations",
          "Famous rivalries and their history",
          "Notable trades and signings",
          "Record-breaking performances",
          "Coaching decisions and strategies",
          "Draft picks and their impact",
          "Conference championships",
          "Rule changes and their effects",
          "Historic team achievements"
        ];
      }
    };

    const prompt = `You are creating a ${category} trivia question ${points === 3 ? 'about field goals (easier)' : 'about touchdowns (harder)'} for casual sports fans. This is worth ${points} points.

IMPORTANT GUIDELINES FOR ${points === 3 ? 'FIELD GOAL (EASIER)' : 'TOUCHDOWN (HARDER)'} QUESTIONS:

${category === 'football' ? `
Question Types for ${points === 3 ? 'Field Goals (Easy)' : 'Touchdowns (Hard)'}:
${getFootballQuestionTypes(points).map(type => `- ${type}`).join('\n')}

SPECIFIC RULES FOR THIS DIFFICULTY:
${points === 3 ? `
- Focus on basic football knowledge that casual fans would know
- Use only current, well-known players and teams
- Avoid specific statistics or historical details
- Questions should be about fundamental aspects of football
- Make answer options clearly distinct
- Use current events and basic football concepts
` : `
- Include more detailed football knowledge
- Can include specific plays or strategies
- Can reference recent seasons and playoffs
- Include team dynamics and game planning
- Focus on current events and recent history
- Keep it challenging but not obscure
`}` : ''}

AVOID REPETITION:
- Check that the question is not too similar to these recently used questions:
${recentQuestions.slice(0, 5).map(q => `"${q}"`).join('\n')}

Format the response EXACTLY as this JSON:
{
  "text": "The question text here?",
  "options": ["First option", "Second option", "Third option", "Fourth option"],
  "correctAnswer": "The correct option (must match one of the options exactly)",
  "explanation": "Brief explanation of why this is correct",
  "category": "${category}",
  "difficulty": ${points}
}`;

    // Generate content using OpenAI with lower temperature for more focused responses
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        { 
          role: "system", 
          content: "You are a football trivia expert that creates varied, engaging questions appropriate for casual fans. For easier questions (field goals), focus on basic knowledge. For harder questions (touchdowns), test deeper understanding but avoid obscure facts."
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    console.log('Raw OpenAI response:', content);

    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    try {
      const questionData = JSON.parse(content) as QuestionData;
      console.log('Successfully parsed question data:', questionData);
      
      // Check for similar questions using more strict similarity threshold for football
      const similarQuestion = await checkForSimilarQuestion(questionData.text, category === 'football' ? 0.6 : 0.7);
      if (similarQuestion) {
        console.log('Similar question found, generating another one');
        return generateSportsQuestion(category, points);
      }
      
      // Add to Firebase with timestamp and metadata
      const now = new Date();
      const docRef = await addDoc(collection(db, "questions"), {
        ...questionData,
        createdAt: now,
        lastUsed: now,
        usageCount: 1,
        questionType: category === 'football' ? (points === 3 ? 'field_goal' : 'touchdown') : undefined
      });
      
      console.log('Added new question to database:', docRef.id);
      return { 
        id: docRef.id,
        ...questionData,
        createdAt: now,
        lastUsed: now,
        usageCount: 1
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }
  } catch (error) {
    console.error("Error generating question:", error);
    return null;
  }
};

// Update the similarity check to be more strict for football questions
const checkForSimilarQuestion = async (questionText: string, similarityThreshold: number = 0.7): Promise<boolean> => {
  try {
    // Get recent questions
    const q = query(
      collection(db, "questions"),
      orderBy("createdAt", "desc"),
      limit(150)
    );
    
    const snapshot = await getDocs(q);
    const existingQuestions = snapshot.docs.map(doc => doc.data().text.toLowerCase());
    const newQuestionText = questionText.toLowerCase();
    
    // Check for similar questions using more strict comparison
    for (const existingQuestion of existingQuestions) {
      const similarity = calculateSimilarity(newQuestionText, existingQuestion);
      if (similarity > similarityThreshold) {
        console.log(`Similar question found (${similarity.toFixed(2)} similarity):`, {
          new: newQuestionText,
          existing: existingQuestion
        });
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error checking for similar questions:", error);
    return false;
  }
};

// Calculate similarity between two strings (simple Levenshtein distance based similarity)
const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

// Calculate Levenshtein distance between two strings
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
};
