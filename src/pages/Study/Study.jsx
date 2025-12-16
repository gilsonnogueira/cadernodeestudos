import React, { useEffect } from 'react';
import { useQuestions } from '../../contexts/QuestionContext';
import QuestionCard from '../../components/Question/QuestionCard';
import { Filter, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function Study() {
    const {
        loading,
        questions,
        totalQuestions,
        currentPage,
        setCurrentPage,
        totalPages,
        filters,
        setFilters,
        availableFilters,
        availableSubjects
    } = useQuestions();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p>Carregando banco de questões...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Sidebar Filters */}
            <aside className="w-full md:w-64 bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-4">
                <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold border-b pb-2">
                    <Filter size={18} /> Filtros
                </div>

                <div className="space-y-4">
                    {/* Search */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">BUSCAR</label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Palavra-chave ou ID..."
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Discipline */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">DISCIPLINA</label>
                        <select
                            className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                            value={filters.discipline}
                            onChange={(e) => setFilters({ ...filters, discipline: e.target.value, subject: '' })}
                        >
                            <option value="">Todas</option>
                            {availableFilters.disciplines.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">ASSUNTO</label>
                        <select
                            className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 disabled:opacity-50"
                            value={filters.subject}
                            onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                            disabled={!filters.discipline}
                        >
                            <option value="">Todos</option>
                            {availableSubjects.map((s, index) => (
                                <option
                                    key={`${s.value}-${index}`}
                                    value={s.value}
                                    style={{ fontWeight: s.level === 0 ? 'bold' : 'normal', paddingLeft: `${s.level * 10}px` }}
                                >
                                    {/* Visual indentation with non-breaking spaces for select options */}
                                    {'\u00A0\u00A0'.repeat(s.level)}{s.level > 0 ? '↳ ' : ''}{s.value}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Banca */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">BANCA</label>
                        <select
                            className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                            value={filters.banca}
                            onChange={(e) => setFilters({ ...filters, banca: e.target.value })}
                        >
                            <option value="">Todas</option>
                            {availableFilters.bancas.map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>

                    {/* Year */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">ANO</label>
                        <select
                            className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        >
                            <option value="">Todos</option>
                            {availableFilters.years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={() => setFilters({ discipline: '', subject: '', banca: '', year: '', search: '' })}
                            className="w-full py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <section className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        Questões <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{totalQuestions} encontradas</span>
                    </h2>
                </div>

                {questions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <p className="text-gray-500 text-lg">Nenhuma questão encontrada com esses filtros.</p>
                        <button
                            onClick={() => setFilters({ discipline: '', subject: '', banca: '', year: '', search: '' })}
                            className="mt-4 text-blue-600 font-semibold hover:underline"
                        >
                            Limpar filtros
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            {questions.map(q => (
                                <QuestionCard key={q.id} question={q} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8 mb-12">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <span className="text-sm text-gray-600 font-medium px-4">
                                    Página {currentPage} de {totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}
