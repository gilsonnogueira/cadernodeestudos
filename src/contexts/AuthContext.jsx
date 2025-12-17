import React, { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut as firebaseSignOut
} from "firebase/auth";
import { auth } from "../services/firebase";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sign in with Google
    async function signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    }

    // Sign in with Email/Password
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Sign up with Email/Password
    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    // Reset Password
    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    // Logout
    function logout() {
        return firebaseSignOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        // Timeout fallback in case Firebase auth hangs
        const timeout = setTimeout(() => {
            if (loading) {
                console.warn('Auth check timed out, proceeding anyway');
                setLoading(false);
            }
        }, 10000);

        return () => {
            unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const value = {
        currentUser,
        signInWithGoogle,
        login,
        signup,
        resetPassword,
        logout,
        isAdmin: false
    };

    // Show loading indicator while checking auth
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: '#f3f4f6'
            }}>
                <div style={{
                    textAlign: 'center',
                    color: '#6b7280'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid #e5e7eb',
                        borderTop: '3px solid #2563eb',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 12px'
                    }}></div>
                    <p>Carregando...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
