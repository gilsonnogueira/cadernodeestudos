export class TaxonomyParser {
    constructor() {
        this.taxonomy = {};
    }

    parse(text) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        let currentDiscipline = null;
        let currentMainTopic = null;
        let currentSubtopic = null;

        for (const line of lines) {
            // Ignore completely empty lines (though split/filter handles most)
            if (!line || line.length < 3) continue;

            // Identifica disciplina (não começa com número)
            if (!line.match(/^\d/)) {
                // If the line is very short or looks like noise, skip. 
                // A valid discipline usually has at least 5 chars (e.g. "Direito").
                if (line.length < 4) continue;

                currentDiscipline = line.trim();
                console.log(`Discipline Found: ${currentDiscipline}`); // Debug log

                this.taxonomy[currentDiscipline] = {
                    name: currentDiscipline,
                    topics: {}
                };
                // Reference for easier lookup
                this.taxonomy[currentDiscipline.toLowerCase()] = this.taxonomy[currentDiscipline];

                currentMainTopic = null;
                currentSubtopic = null;
                continue;
            }

            if (!currentDiscipline) continue;

            // Identifica nível da hierarquia
            // Matches "1. Name", "1.1 Name", "1.1.1 Name"
            const match = line.match(/^(\d+(?:\.\d+)*)\.\s*(.+)$/);
            if (!match) continue;

            const [, number, name] = match;
            const level = number.split('.').length;
            const cleanName = name.trim();
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
                // Subtópico (ex: "1.1 Grafia...")
                currentSubtopic = cleanName;
                if (discObj.topics[currentMainTopic]) {
                    discObj.topics[currentMainTopic].subtopics[cleanName] = {
                        number,
                        name: cleanName,
                        children: []
                    };
                }
            } else if (level === 3 && currentSubtopic) {
                // Sub-subtópico (ex: "1.1.1 ...")
                if (discObj.topics[currentMainTopic] &&
                    discObj.topics[currentMainTopic].subtopics[currentSubtopic]) {

                    discObj.topics[currentMainTopic].subtopics[currentSubtopic].children.push({
                        number,
                        name: cleanName
                    });
                }
            }
        }
        console.log("Taxonomy Parsed:", Object.keys(this.taxonomy).length, "disciplines");
    }

    getSubjectsForDiscipline(discipline) {
        if (!discipline) return [];

        const disciplineData = this.taxonomy[discipline] || this.taxonomy[discipline.toLowerCase().trim()];
        if (!disciplineData) return [];

        const subjects = [];

        for (const topicKey in disciplineData.topics) {
            const topic = disciplineData.topics[topicKey];

            // Level 0
            subjects.push({
                value: topic.name,
                label: `${topic.number}. ${topic.name}`,
                level: 0
            });

            for (const subtopicKey in topic.subtopics) {
                const subtopic = topic.subtopics[subtopicKey];

                // Level 1
                subjects.push({
                    value: subtopic.name,
                    label: `${subtopic.number} ${subtopic.name}`,
                    level: 1
                });

                // Level 2
                if (subtopic.children) {
                    subtopic.children.forEach(child => {
                        subjects.push({
                            value: child.name,
                            label: `${child.number} ${child.name}`,
                            level: 2
                        });
                    });
                }
            }
        }
        return subjects;
    }
}

export const taxonomyParser = new TaxonomyParser();
