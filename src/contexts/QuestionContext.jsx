import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { loadQuestions } from '../services/questionsLoader';
import { taxonomyParser } from '../utils/TaxonomyParser';
import { TAXONOMY_RAW_DATA } from '../services/taxonomyData';
import { PersistenceService } from '../services/persistence';
import { useAuth } from './AuthContext';

const QuestionContext = createContext();

export function useQuestions() {
    return useContext(QuestionContext);
}

export function QuestionProvider({ children }) {
    const { currentUser } = useAuth();
    const [allQuestions, setAllQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [userProgress, setUserProgress] = useState({});

    // Initialize Taxonomy & Load Questions & Progress
    useEffect(() => {
        // 1. Taxonomy
        if (TAXONOMY_RAW_DATA) {
            taxonomyParser.parse(TAXONOMY_RAW_DATA);
        }

        // 2. Questions - Load asynchronously
        loadQuestions()
            .then(questionsData => {
                console.log(`Loaded ${questionsData.length} questions`);
                const qData = questionsData.map((q, idx) => ({
                    ...q,
                    id: q.id || `q-${idx}`
                }));
                setAllQuestions(qData);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load questions:', err);
                setLoadError(err.message);
                setLoading(false);
            });

        // 3. Local Progress
        const saved = PersistenceService.getLocalProgress();
        setUserProgress(saved);
    }, []);

    // Sync with Firestore
    useEffect(() => {
        if (currentUser) {
            PersistenceService.syncWithFirestore(currentUser.uid, userProgress)
                .then(merged => setUserProgress(merged));
        }
    }, [currentUser]);

    // Action: Answer Question
    const answerQuestion = (questionId, isCorrect, selectedOption) => {
        const newEntry = {
            status: isCorrect ? 'correct' : 'wrong',
            answer: selectedOption,
            timestamp: Date.now()
        };

        setUserProgress(prev => {
            const next = { ...prev, [questionId]: newEntry };
            PersistenceService.saveLocalProgress(next);
            if (currentUser) {
                // Fire & Forget sync for responsiveness
                PersistenceService.syncWithFirestore(currentUser.uid, next);
            }
            return next;
        });
    };

    // Filters
    const [filters, setFilters] = useState({
        discipline: '',
        subject: '',
        banca: '',
        year: '',
        search: ''
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Unique values for filter dropdowns
    const availableFilters = useMemo(() => {
        const disciplines = [...new Set(allQuestions.map(q => q.discipline).filter(Boolean))].sort();
        const bancas = [...new Set(allQuestions.map(q => q.banca).filter(Boolean))].sort();
        const years = [...new Set(allQuestions.map(q => q.year).filter(Boolean))].sort((a, b) => b - a);

        return { disciplines, bancas, years };
    }, [allQuestions]);

    // Derived subjects based on selected discipline (Hierarchical)
    const availableSubjects = useMemo(() => {
        if (!filters.discipline) return [];
        return taxonomyParser.getSubjectsForDiscipline(filters.discipline);
    }, [filters.discipline]);

    // Filtered Questions Logic
    const filteredQuestions = useMemo(() => {
        return allQuestions.filter(q => {
            // Discipline
            if (filters.discipline && q.discipline !== filters.discipline) return false;

            // Subject
            if (filters.subject) {
                if (Array.isArray(q.subjects)) {
                    if (!q.subjects.some(s => s.toLowerCase().includes(filters.subject.toLowerCase()))) return false;
                } else if (typeof q.subjects === 'string') {
                    if (!q.subjects.toLowerCase().includes(filters.subject.toLowerCase())) return false;
                }
            }

            // Banca
            if (filters.banca && q.banca !== filters.banca) return false;

            // Year
            if (filters.year && q.year.toString() !== filters.year) return false;

            // Search
            if (filters.search) {
                const lowerSearch = filters.search.toLowerCase();
                const contentMatch = q.enunciation?.toLowerCase().includes(lowerSearch) ||
                    q.id?.toLowerCase().includes(lowerSearch);
                if (!contentMatch) return false;
            }

            return true;
        });
    }, [allQuestions, filters]);

    // Paginated Questions
    const paginatedQuestions = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredQuestions.slice(start, start + itemsPerPage);
    }, [filteredQuestions, currentPage]);

    const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);

    const value = {
        loading,
        loadError,
        questions: paginatedQuestions,
        allQuestions,
        totalQuestions: filteredQuestions.length,
        totalPages,
        currentPage,
        setCurrentPage,
        filters,
        setFilters,
        availableFilters,
        availableSubjects,
        userProgress,
        answerQuestion
    };

    return (
        <QuestionContext.Provider value={value}>
            {children}
        </QuestionContext.Provider>
    );
}
