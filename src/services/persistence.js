import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const STORAGE_KEY = 'user_progress_v1';

export const PersistenceService = {
    // --- Local Storage ---

    getLocalProgress() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('Error reading local progress:', e);
            return {};
        }
    },

    saveLocalProgress(progress) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        } catch (e) {
            console.error('Error saving local progress:', e);
        }
    },

    // --- Firestore ---

    async syncWithFirestore(uid, localProgress) {
        if (!uid) return;

        const userRef = doc(db, 'users', uid);

        try {
            // 1. Get remote data
            const docSnap = await getDoc(userRef);
            let remoteProgress = {};

            if (docSnap.exists()) {
                remoteProgress = docSnap.data().progress || {};
            }

            // 2. Merge: Remote wins if newer (simple merge for now, can be improved)
            // Actually, for a single user, we usually want the union of answered questions.
            // If we want to be safe, we can use timestamps. For now, let's just merge keys.

            const mergedProgress = { ...remoteProgress, ...localProgress };

            // 3. Save back to Firestore
            // We debounce this call in the UI, but here we execute the write.
            await setDoc(userRef, { progress: mergedProgress }, { merge: true });

            // 4. Update local storage with merged data
            this.saveLocalProgress(mergedProgress);

            return mergedProgress;
        } catch (e) {
            console.error('Error syncing with Firestore:', e);
            // Fallback: just keep using local
            return localProgress;
        }
    }
};
