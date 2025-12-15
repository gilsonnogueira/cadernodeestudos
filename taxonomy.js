// Taxonomia - Sistema de Hierarquia de Assuntos
// ============================================

class TaxonomyManager {
    constructor() {
        this.taxonomy = {};
        this.loaded = false;
    }

    async loadTaxonomy() {
        // Prioridade 1: Dados embutidos (Mais robusto para execução local)
        if (typeof TAXONOMY_RAW_DATA !== 'undefined') {
            console.log('📦 Taxonomia carregada via dados embutidos (taxonomy_data.js)');
            this.parseTaxonomy(TAXONOMY_RAW_DATA);
            this.loaded = true;
            window.dispatchEvent(new CustomEvent('taxonomyLoaded'));
            return;
        }

        const paths = ['Taxonomia_Limpa.txt', '../Taxonomia_Limpa.txt']; // Tenta local e pai

        for (const path of paths) {
            try {
                console.log(`Tentando carregar taxonomia de: ${path}`);
                const response = await fetch(path);
                if (response.ok) {
                    const text = await response.text();
                    this.parseTaxonomy(text);
                    this.loaded = true;
                    console.log(`✅ Taxonomia carregada com sucesso de ${path}! Disciplinas: ${Object.keys(this.taxonomy).length}`);

                    // Dispara evento para avisar app que carregou
                    window.dispatchEvent(new CustomEvent('taxonomyLoaded'));
                    return;
                } else {
                    console.warn(`Resposta não-OK para ${path}: ${response.status}`);
                }
            } catch (error) {
                console.warn(`Erro ao carregar de ${path}:`, error);
            }
        }

        console.error('❌ Falha crítica: Taxonomia não pôde ser carregada.');
    }

    parseTaxonomy(text) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        let currentDiscipline = null;
        let currentMainTopic = null;
        let currentSubtopic = null;

        for (const line of lines) {
            // Identifica disciplina (não começa com número)
            if (!line.match(/^\d/)) {
                // Normaliza chave da disciplina
                currentDiscipline = line.trim();
                // Armazena com chave original E normalizada para facilitar busca
                this.taxonomy[currentDiscipline] = {
                    name: currentDiscipline,
                    topics: {}
                };
                // Cria referência lowercase
                this.taxonomy[currentDiscipline.toLowerCase()] = this.taxonomy[currentDiscipline];

                currentMainTopic = null;
                currentSubtopic = null;
                continue;
            }

            if (!currentDiscipline) continue;

            // Identifica nível da hierarquia
            const match = line.match(/^(\d+(?:\.\d+)*)\.\s*(.+)$/);
            if (!match) continue;

            const [, number, name] = match;
            const level = number.split('.').length;
            const cleanName = name.trim();

            // Usa a referência principal da disciplina
            const discObj = this.taxonomy[currentDiscipline];

            if (level === 1) {
                // Tópico principal (ex: "1. Ortografia")
                currentMainTopic = cleanName;
                discObj.topics[currentMainTopic] = {
                    number,
                    name: cleanName,
                    subtopics: {}
                };
                currentSubtopic = null;
            } else if (level === 2 && currentMainTopic) {
                // Subtópico (ex: "1.1 Grafia e Emprego...")
                currentSubtopic = cleanName;
                if (discObj.topics[currentMainTopic]) {
                    discObj.topics[currentMainTopic].subtopics[cleanName] = {
                        number,
                        name: cleanName
                    };
                }
            } else if (level === 3 && currentSubtopic) {
                // Sub-subtópico (ex: "1.1.1 ...")
                if (discObj.topics[currentMainTopic] &&
                    discObj.topics[currentMainTopic].subtopics[currentSubtopic]) {

                    if (!discObj.topics[currentMainTopic].subtopics[currentSubtopic].children) {
                        discObj.topics[currentMainTopic].subtopics[currentSubtopic].children = [];
                    }
                    discObj.topics[currentMainTopic].subtopics[currentSubtopic].children.push({
                        number,
                        name: cleanName
                    });
                }
            }
        }
    }

    // ... (rest of methods)

    // Obtém lista hierárquica de assuntos para uma disciplina
    getSubjectsForDiscipline(discipline) {
        if (!this.loaded || !discipline) {
            return [];
        }

        // Tenta busca exata ou lowercase
        const disciplineData = this.taxonomy[discipline] || this.taxonomy[discipline.toLowerCase().trim()];

        if (!disciplineData) {
            console.warn(`Disciplina não encontrada na taxonomia: "${discipline}"`);
            return [];
        }

        const subjects = [];
        // ...

        for (const topicKey in disciplineData.topics) {
            const topic = disciplineData.topics[topicKey];

            // Adiciona tópico principal
            subjects.push({
                value: topic.name,
                label: `${topic.number}. ${topic.name}`,
                level: 0
            });

            // Adiciona subtópicos
            for (const subtopicKey in topic.subtopics) {
                const subtopic = topic.subtopics[subtopicKey];
                subjects.push({
                    value: subtopic.name,
                    label: `  ${subtopic.number} ${subtopic.name}`,
                    level: 1
                });

                // Adiciona sub-subtópicos
                if (subtopic.children) {
                    subtopic.children.forEach(child => {
                        subjects.push({
                            value: child.name,
                            label: `    ${child.number} ${child.name}`,
                            level: 2
                        });
                    });
                }
            }
        }

        return subjects;
    }

    // Obtém todas as disciplinas
    getDisciplines() {
        return Object.keys(this.taxonomy);
    }

    // Busca um assunto na taxonomia
    findSubjectInTaxonomy(subjectName, disciplineName) {
        if (!disciplineName || !subjectName) return null;

        // Tenta encontrar a disciplina
        const disc = this.taxonomy[disciplineName] || this.taxonomy[disciplineName.toLowerCase().trim()];
        if (!disc) return null;

        const cleanSubject = subjectName.trim().toLowerCase();

        // Itera sobre tópicos
        for (const topicKey in disc.topics) {
            const topic = disc.topics[topicKey];
            if (topic.name.toLowerCase() === cleanSubject) {
                return { type: 'topic', name: topic.name, number: topic.number, fullPath: topic.name };
            }

            // Itera sobre subtópicos
            for (const subKey in topic.subtopics) {
                const sub = topic.subtopics[subKey];
                if (sub.name.toLowerCase() === cleanSubject) {
                    return { type: 'subtopic', name: sub.name, number: sub.number, fullPath: `${topic.name} > ${sub.name}` };
                }

                // Itera sobre filhos
                if (sub.children) {
                    for (const child of sub.children) {
                        if (child.name.toLowerCase() === cleanSubject) {
                            return { type: 'child', name: child.name, number: child.number, fullPath: `${topic.name} > ${sub.name} > ${child.name}` };
                        }
                    }
                }
            }
        }
        return null;
    }

    // Enriquece questões com informações da taxonomia
    enrichQuestionsWithTaxonomy(questions) {
        if (!this.loaded) return questions;

        return questions.map(q => {
            const enrichedSubjects = (q.subjects || []).map(subject => {
                const match = this.findSubjectInTaxonomy(subject, q.discipline);
                return {
                    original: subject,
                    taxonomy: match,
                    display: match ? match.fullPath : subject
                };
            });

            return {
                ...q,
                enrichedSubjects,
                taxonomyMatched: enrichedSubjects.some(s => s.taxonomy !== null)
            };
        });
    }
}

// Exporta instância global
window.taxonomyManager = new TaxonomyManager();
