// gameService.ts
import { 
    doc, 
    setDoc, 
    updateDoc, 
    getDoc, 
    collection, 
    addDoc,
    serverTimestamp,
    deleteDoc,
    Firestore
} from "firebase/firestore";
import { db } from "./firebase";

const getFirestore = () => {
  if (typeof window === 'undefined') return null;
  return db;
};

// Create a new game
export async function createGame(gameCode: string, playerName: string): Promise<string | null> {
  const firestore = getFirestore();
  if (!firestore) return null;

  try {
    const gameRef = doc(firestore, "games", gameCode);
    await setDoc(gameRef, {
      sport: "random",
      hostName: playerName,
      status: "waiting",
      players: {
        host: {
          name: playerName,
          score: 0,
          timeouts: 3
        }
      },
      createdAt: serverTimestamp()
    });
    return gameCode;
  } catch (error) {
    console.error("Error creating game:", error);
    return null;
  }
}

// Join an existing game
export async function joinGame(gameCode: string, playerName: string) {
  if (!gameCode) {
    throw new Error('Game code is required');
  }

  if (!playerName) {
    throw new Error('Player name is required');
  }

  const firestore = getFirestore();
  if (!firestore) throw new Error('Firestore is not initialized');

  const gameRef = doc(firestore, 'games', gameCode);
  const gameDoc = await getDoc(gameRef);

  if (!gameDoc.exists()) {
    throw new Error('Game not found. Please check the game code and try again.');
  }

  const gameData = gameDoc.data();
  
  if (gameData.status !== 'waiting') {
    throw new Error('This game has already started or ended.');
  }

  // Add player to the game's players array if not already present
  const players = gameData.players || [];
  if (!players.includes(playerName)) {
    players.push(playerName);
    await updateDoc(gameRef, { players });
  }

  return {
    gameId: gameCode,
    players,
    status: gameData.status,
    category: gameData.category,
    difficulty: gameData.difficulty
  };
}

// Get game by ID
export const getGame = async (gameId: string) => {
  const firestore = getFirestore();
  if (!firestore) return null;

  try {
    const gameRef = doc(firestore, "games", gameId);
    const gameSnap = await getDoc(gameRef);
    
    if (gameSnap.exists()) {
      return { id: gameSnap.id, ...gameSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting game:", error);
    return null;
  }
};

// Get winning score based on sport
const getWinningScore = (sport: string): number => {
  switch (sport) {
    case "football":
      return 50;
    case "soccer":
      return 10;
    case "baseball":
    case "basketball":
      return 21;
    default:
      return 21;
  }
};

// Get available point values based on sport
export const getPointValues = (sport: string): number[] => {
  switch (sport) {
    case "football":
      return [3, 6]; // Field goal (3) and touchdown (6)
    case "soccer":
      return [1]; // Goal (1)
    case "baseball":
      return [1, 2, 3, 4]; // Single, double, triple, home run
    case "basketball":
      return [2, 3]; // 2-pointer and 3-pointer
    default:
      return [2, 3];
  }
};

// Get difficulty percentage based on point value and sport
export const getDifficultyPercentage = (sport: string, pointValue: number): number => {
  switch (sport) {
    case "football":
      return pointValue === 6 ? 0.65 : 0.75; // 65% for TD, 75% for FG
    case "soccer":
      return 0.70; // 70% for goals
    case "baseball":
      switch (pointValue) {
        case 1: return 0.80; // Single - easiest
        case 2: return 0.70; // Double
        case 3: return 0.60; // Triple
        case 4: return 0.50; // Home run - hardest
        default: return 0.70;
      }
    case "basketball":
      return pointValue === 3 ? 0.65 : 0.75; // 65% for 3pt, 75% for 2pt
    default:
      return 0.70;
  }
};

// Mark game for deletion when a player exits
export const markGameForDeletion = async (gameId: string, playerRole: 'host' | 'guest') => {
  const firestore = getFirestore();
  if (!firestore) throw new Error('Firestore is not initialized');

  try {
    const gameRef = doc(firestore, "games", gameId);
    const gameSnap = await getDoc(gameRef);
    
    if (!gameSnap.exists()) {
      return false;
    }
    
    const gameData = gameSnap.data();
    
    // Update the player's exit status
    await updateDoc(gameRef, {
      [`players.${playerRole}.hasExited`]: true,
      lastActivityAt: serverTimestamp()
    });

    // Check if both players have exited
    const otherRole = playerRole === 'host' ? 'guest' : 'host';
    const otherPlayerHasExited = gameData.players?.[otherRole]?.hasExited;
    
    if (otherPlayerHasExited) {
      // Both players have left, set deletion time to 1 hour from now
      const oneHourFromNow = new Date();
      oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
      
      await updateDoc(gameRef, {
        deleteAfter: oneHourFromNow,
        status: "completed",
        completedAt: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error marking game for deletion:", error);
    return false;
  }
};

// Update game after answering a question
export const updateGameAfterAnswer = async (
  gameId: string, 
  userId: string, 
  isCorrect: boolean, 
  points: number,
  sport: string
) => {
  const firestore = getFirestore();
  if (!firestore) throw new Error('Firestore is not initialized');

  try {
    const gameRef = doc(firestore, "games", gameId);
    const gameSnap = await getDoc(gameRef);
    
    if (!gameSnap.exists()) {
      throw new Error("Game not found");
    }
    
    const gameData = gameSnap.data();
    const isPlayerOne = userId === gameData.playerOne;
    
    if (gameData.currentTurn !== userId) {
      throw new Error("Not your turn");
    }
    
    const scoreField = isPlayerOne ? "playerOneScore" : "playerTwoScore";
    const newScore = gameData[scoreField] + (isCorrect ? points : 0);
    const nextTurn = isPlayerOne ? gameData.playerTwo : gameData.playerOne;
    
    const updateData: any = {
      [scoreField]: newScore,
      currentTurn: nextTurn,
      lastActivityAt: serverTimestamp()
    };
    
    // Check for win based on sport
    const winningScore = getWinningScore(sport);
    if (newScore >= winningScore) {
      // Calculate timestamp for 1 hour from now
      const oneHourFromNow = new Date();
      oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
      
      updateData.status = "completed";
      updateData.winner = userId;
      updateData.completedAt = serverTimestamp();
      // Set deletion time to 1 hour from completion
      updateData.deleteAfter = oneHourFromNow;
    }
    
    await updateDoc(gameRef, updateData);
    
    return { newScore, gameOver: newScore >= winningScore };
  } catch (error) {
    console.error("Error updating game after answer:", error);
    return null;
  }
};

// Use a timeout
export const useTimeout = async (gameId: string, userId: string) => {
  const firestore = getFirestore();
  if (!firestore) throw new Error('Firestore is not initialized');

  try {
    const gameRef = doc(firestore, "games", gameId);
    const gameSnap = await getDoc(gameRef);
    
    if (!gameSnap.exists()) {
      throw new Error("Game not found");
    }
    
    const gameData = gameSnap.data();
    const isPlayerOne = userId === gameData.playerOne;
    
    if (gameData.currentTurn !== userId) {
      throw new Error("Not your turn");
    }
    
    const timeoutsField = isPlayerOne ? "playerOneTimeoutsRemaining" : "playerTwoTimeoutsRemaining";
    
    if (gameData[timeoutsField] <= 0) {
      throw new Error("No timeouts remaining");
    }
    
    await updateDoc(gameRef, {
      [timeoutsField]: gameData[timeoutsField] - 1,
      lastActivityAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error using timeout:", error);
    return false;
  }
};

  