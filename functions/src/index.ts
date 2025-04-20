/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as admin from "firebase-admin";
import {pubsub} from "firebase-functions/v1";

admin.initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// Cleanup completed games every 15 minutes
export const cleanupCompletedGames = pubsub
  .schedule("every 15 minutes")
  .onRun(async () => {
    const now = new Date();
    try {
      // Query for games that should be deleted
      const snapshot = await admin.firestore()
        .collection("games")
        .where("deleteAfter", "<=", now)
        .get();

      if (snapshot.empty) {
        console.log("No games to delete");
        return null;
      }

      // Delete each game that has passed its deletion time
      const batch = admin.firestore().batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Successfully deleted ${snapshot.size} completed games`);
    } catch (error) {
      console.error("Error cleaning up games:", error);
    }
    return null;
  });
