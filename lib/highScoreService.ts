import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  where,
  runTransaction,
  QuerySnapshot,
  DocumentData
} from "firebase/firestore";
import { db } from "./firebase";

interface HighScore {
  code: string;  // 3-letter code
  score: number;
  sport: string;
  timestamp: Date;
}

const MAX_HIGH_SCORES_PER_SPORT = 10; // Store top 10 scores per sport

// Add a new high score
export const addHighScore = async (code: string, score: number, sport: string): Promise<boolean> => {
  try {
    // Validate code is 3 letters
    if (!/^[A-Z]{3}$/.test(code)) {
      throw new Error("Code must be 3 uppercase letters");
    }

    // Use a transaction to ensure atomic operations
    return await runTransaction(db, async (transaction) => {
      // Get current high scores for this sport
      const highScoresRef = collection(db, "highScores");
      const q = query(
        highScoresRef,
        where("sport", "==", sport),
        orderBy("score", "desc"),
        limit(MAX_HIGH_SCORES_PER_SPORT)
      );
      
      const querySnapshot = await getDocs(q);
      const currentScores = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as DocumentData
      }));

      // Check if this score qualifies as a high score
      const lowestHighScore = currentScores.length >= MAX_HIGH_SCORES_PER_SPORT 
        ? (currentScores[currentScores.length - 1] as any).score 
        : 0;

      if (score > lowestHighScore || currentScores.length < MAX_HIGH_SCORES_PER_SPORT) {
        // This is a high score! Add it
        const newScoreRef = doc(collection(db, "highScores"));
        await transaction.set(newScoreRef, {
          code,
          score,
          sport,
          timestamp: new Date()
        });

        // If we're at the limit, remove the lowest score
        if (currentScores.length >= MAX_HIGH_SCORES_PER_SPORT) {
          const lowestScoreDoc = currentScores[currentScores.length - 1];
          const lowestScoreRef = doc(db, "highScores", lowestScoreDoc.id);
          await transaction.delete(lowestScoreRef);
        }

        return true;
      }

      return false; // Not a high score
    });
  } catch (error) {
    console.error("Error adding high score:", error);
    return false;
  }
};

// Get top high scores for a sport
export const getTopHighScores = async (sport: string, numScores: number = MAX_HIGH_SCORES_PER_SPORT): Promise<HighScore[]> => {
  try {
    const highScoresRef = collection(db, "highScores");
    const q = query(
      highScoresRef,
      where("sport", "==", sport),
      orderBy("score", "desc"),
      limit(numScores)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    })) as HighScore[];
  } catch (error) {
    console.error("Error getting high scores:", error);
    return [];
  }
}; 