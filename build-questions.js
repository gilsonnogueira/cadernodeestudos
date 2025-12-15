const fs = require('fs');
const path = require('path');

const questionsDir = path.join(__dirname, 'Questões');
const outputFile = path.join(__dirname, 'questions_db.js');

// Ensure directory exists
if (!fs.existsSync(questionsDir)) {
    console.error('Pasta "Questões" não encontrada!');
    process.exit(1);
}

// Read all JSON files
const files = fs.readdirSync(questionsDir).filter(file => file.endsWith('.json'));
let allQuestions = [];

console.log(`Encontrados ${files.length} arquivos JSON.`);

files.forEach(file => {
    const filePath = path.join(questionsDir, file);
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);

        // Handle different structures if necessary
        // Assuming data is array of questions or has a specific property
        if (Array.isArray(data)) {
            allQuestions = allQuestions.concat(data);
        } else if (data.items && Array.isArray(data.items)) {
            allQuestions = allQuestions.concat(data.items);
        } else {
            // If it's a single object or different structure, try to push or inspect
            // For now assuming array of questions as typical in this project
            allQuestions.push(data);
        }
        console.log(`> Carregado: ${file}`);
    } catch (err) {
        console.error(`Erro ao ler ${file}:`, err.message);
    }
});

// Remove duplicates based on ID
const uniqueQuestions = Array.from(new Map(allQuestions.map(q => [q.id, q])).values());

console.log(`Total de questões únicas: ${uniqueQuestions.length}`);

// Generate the JS file content
const jsContent = `window.OFFLINE_QUESTIONS = ${JSON.stringify(uniqueQuestions, null, 2)};`;

fs.writeFileSync(outputFile, jsContent);
console.log(`Arquivo gerado com sucesso: ${outputFile}`);
