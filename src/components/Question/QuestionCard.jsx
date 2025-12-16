import React, { useState } from 'react';
import { CheckCircle, XCircle, Eraser, AlertCircle } from 'lucide-react';

export default function QuestionCard({ question }) {
    const [selectedAlternative, setSelectedAlternative] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [excludedOptions, setExcludedOptions] = useState([]);

    if (!question) return null;

    const isCorrect = selectedAlternative === question.answer_key;

    function handleSelect(letter) {
        if (showResult) return;
        setSelectedAlternative(letter);
    }

    function toggleExclusion(letter, e) {
        e.stopPropagation();
        if (showResult) return;

        setExcludedOptions(prev =>
            prev.includes(letter)
                ? prev.filter(l => l !== letter)
                : [...prev, letter]
        );
    }

    function handleConfirm() {
        if (!selectedAlternative) return;
        setShowResult(true);
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 transition-all hover:shadow-md">
            {/* Header Info */}
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wide">
                <span className="bg-gray-100 px-2 py-1 rounded">{question.banca}</span>
                <span className="bg-gray-100 px-2 py-1 rounded">{question.year}</span>
                <span className="bg-gray-100 px-2 py-1 rounded">{question.orgao}</span>
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{question.discipline}</span>
                {question.subjects && question.subjects.map((s, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded hidden md:inline-block">{s}</span>
                ))}
            </div>

            {/* Enunciation */}
            <div className="text-gray-800 text-lg leading-relaxed mb-6 font-medium">
                {question.enunciation}
            </div>

            {/* Alternatives */}
            <div className="space-y-3">
                {question.alternatives.map((alt) => {
                    const isSelected = selectedAlternative === alt.letter;
                    const isExcluded = excludedOptions.includes(alt.letter);
                    const isKey = alt.letter === question.answer_key;

                    let cardClass = "relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all group ";
                    let icon = <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:border-blue-400 group-hover:text-blue-400">{alt.letter}</div>;

                    if (showResult) {
                        if (isKey) {
                            cardClass += "bg-green-50 border-green-500 text-green-900";
                            icon = <CheckCircle className="text-green-500" />;
                        } else if (isSelected && !isKey) {
                            cardClass += "bg-red-50 border-red-500 text-red-900";
                            icon = <XCircle className="text-red-500" />;
                        } else {
                            cardClass += "border-gray-200 opacity-60";
                        }
                    } else {
                        if (isExcluded) {
                            cardClass += "bg-gray-50 border-gray-200 opacity-50";
                        } else if (isSelected) {
                            cardClass += "bg-blue-50 border-blue-500 shadow-sm";
                            icon = <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">{alt.letter}</div>;
                        } else {
                            cardClass += "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/30";
                        }
                    }

                    return (
                        <div
                            key={alt.letter}
                            onClick={() => !isExcluded && handleSelect(alt.letter)}
                            className={cardClass}
                        >
                            {/* Exclusion Button */}
                            {!showResult && (
                                <button
                                    onClick={(e) => toggleExclusion(alt.letter, e)}
                                    className={`absolute right-4 top-4 p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 ${isExcluded ? 'text-red-500 bg-red-100' : ''}`}
                                    title="Tachar alternativa"
                                >
                                    <Eraser size={16} />
                                </button>
                            )}

                            <div className="flex-shrink-0 mt-0.5">
                                {icon}
                            </div>
                            <div className={`flex-1 ${isExcluded ? 'line-through text-gray-400' : ''}`}>
                                {alt.text}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end">
                {!showResult ? (
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedAlternative}
                        className={`px-6 py-2.5 rounded-lg font-semibold text-white transition-all shadow-md
                    ${selectedAlternative
                                ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform active:scale-95'
                                : 'bg-gray-300 cursor-not-allowed'}
                `}
                    >
                        Responder
                    </button>
                ) : (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${isCorrect ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                        {isCorrect ? 'Parabéns! Você acertou.' : `Ops! A resposta correta era a letra ${question.answer_key}.`}
                    </div>
                )}
            </div>
        </div>
    );
}
