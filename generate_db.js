const fs = require('fs');
const path = require('path');

const questionsDir = path.join(__dirname, 'Questões');
const outputFile = path.join(__dirname, 'questions_db.js');

try {
    const files = fs.readdirSync(questionsDir).filter(f => f.endsWith('.json'));
    console.log(`Encontrados ${files.length} arquivos.`);

    let allQuestions = [];

    files.forEach(file => {
        const filePath = path.join(questionsDir, file);
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const json = JSON.parse(content);
            if (Array.isArray(json)) {
                allQuestions = allQuestions.concat(json);
            }
        } catch (err) {
            console.error(`Erro ao ler ${file}:`, err.message);
        }
    });

    // Remove duplicatas por ID
    const uniqueQuestions = Array.from(new Map(allQuestions.map(q => [q.id, q])).values());

    const jsContent = `window.OFFLINE_QUESTIONS = ${JSON.stringify(uniqueQuestions)};`;
    fs.writeFileSync(outputFile, jsContent);
    console.log(`Sucesso! ${uniqueQuestions.length} questões salvas em questions_db.js`);

} catch (err) {
    console.error('Erro:', err);
}
