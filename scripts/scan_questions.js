import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_DIR = path.join(__dirname, '..', 'questions_raw');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'services', 'questions.json');

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function scanQuestions() {
    console.log('🔍 Scanning for questions in:', RAW_DIR);

    if (!fs.existsSync(RAW_DIR)) {
        console.error('❌ Directory questions_raw not found!');
        process.exit(1);
    }

    const files = fs.readdirSync(RAW_DIR).filter(file => file.endsWith('.json'));
    let allQuestions = [];

    for (const file of files) {
        const filePath = path.join(RAW_DIR, file);
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(content);

            // Handle different formats if necessary. 
            // Assuming array of questions or key "questions"
            let questionsToAdd = [];
            if (Array.isArray(data)) {
                questionsToAdd = data;
            } else if (data.questions && Array.isArray(data.questions)) {
                questionsToAdd = data.questions;
            } else {
                console.warn(`⚠️  Skipping ${file}: Invalid format`);
                continue;
            }

            // Add source metadata
            questionsToAdd = questionsToAdd.map(q => ({
                ...q,
                _sourceFile: file,
                id: q.id // Ensure ID exists, or generate one
            }));

            allQuestions = [...allQuestions, ...questionsToAdd];
            console.log(`✅ Loaded ${questionsToAdd.length} questions from ${file}`);
        } catch (err) {
            console.error(`❌ Error reading ${file}:`, err.message);
        }
    }

    console.log(`\n📊 Total Questions: ${allQuestions.length}`);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allQuestions, null, 2), 'utf-8');
    console.log(`💾 Saved consolidated database to: ${OUTPUT_FILE}`);
}

scanQuestions();
