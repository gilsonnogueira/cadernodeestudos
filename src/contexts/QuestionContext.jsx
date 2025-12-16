import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import questionsData from '../services/questions.json';

const QuestionContext = createContext();

export function useQuestions() {
    return useContext(QuestionContext);
}

export function QuestionProvider({ children }) {
    const [allQuestions, setAllQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

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

    // Load questions on mount
    useEffect(() => {
        // Simulate async load if needed, for now direct import
        console.log(`Loaded ${questionsData.length} questions`);
        setAllQuestions(questionsData);
        setLoading(false);
    }, []);

    // Unique values for filter dropdowns
    const availableFilters = useMemo(() => {
        const disciplines = [...new Set(allQuestions.map(q => q.discipline).filter(Boolean))].sort();
        const bancas = [...new Set(allQuestions.map(q => q.banca).filter(Boolean))].sort();
        const years = [...new Set(allQuestions.map(q => q.year).filter(Boolean))].sort((a, b) => b - a);

        return { disciplines, bancas, years };
    }, [allQuestions]);

    // Derived subjects based on selected discipline
    const availableSubjects = useMemo(() => {
        if (!filters.discipline) return [];
        const subjects = new Set();
        allQuestions
            .filter(q => q.discipline === filters.discipline)
            .forEach(q => {
                if (Array.isArray(q.subjects)) q.subjects.forEach(s => subjects.add(s));
                else if (typeof q.subjects === 'string') subjects.add(q.subjects);
            });
        return [...subjects].sort();
    }, [allQuestions, filters.discipline]);

    // Filtered Questions Logic
    const filteredQuestions = useMemo(() => {
        return allQuestions.filter(q => {
            // Discipline
            if (filters.discipline && q.discipline !== filters.discipline) return false;

            // Subject (Check if array contains or string matches)
            if (filters.subject) {
                if (Array.isArray(q.subjects)) {
                    if (!q.subjects.includes(filters.subject)) return false;
                } else if (q.subjects !== filters.subject) return false;
            }

            // Banca
            if (filters.banca && q.banca !== filters.banca) return false;

            // Year
            if (filters.year && q.year !== filters.year) return false;

            // Search (Content or ID)
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
        questions: paginatedQuestions,
        totalQuestions: filteredQuestions.length,
        totalPages,
        currentPage,
        setCurrentPage,
        filters,
        setFilters,
        availableFilters,
        availableSubjects
    };

    return (
        <QuestionContext.Provider value={value}>
            {children}
        </QuestionContext.Provider>
    );
}
