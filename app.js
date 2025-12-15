// Banco de Questões - Sistema Completo (Elegant Light Theme)
// ========================================================
// app.js

class QuestionBank {
    constructor() {
        this.allQuestions = [];
        this.filteredQuestions = [];
        this.currentPage = 1;
        this.questionsPerPage = 10;
        this.currentPage = 1;
        this.questionsPerPage = 10;
        this.userProgress = {};
        this.currentUser = null; // Store Firebase User

        this.filters = {
            discipline: null,
            subject: null,
            banca: null,
            year: null,
            modalidade: null
        };

        this.sortSettings = {
            pedagogical: false,
            repeat: false,
            priority: 'min'
        };

        this.init();
        this.currentFocusIndex = -1;
    }

    // --- FIREBASE INTEGRATION ---
    init() {
        if (typeof firebase === 'undefined') {
            console.error('Firebase SDK not loaded.');
            document.body.innerHTML += '<div style="position:fixed;top:0;left:0;width:100%;padding:20px;background:red;color:white;z-index:9999">ERRO CRÍTICO: Firebase não foi carregado. Verifique sua conexão ou adblocker.</div>';
            return;
        }
        
        this.checkAuth();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.loadQuestionsFromJSON(); // Load database immediately
    }

    checkAuth() {
        // Observer for Auth State
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.currentUser = user;
                console.log('User logged in:', user.email);
                this.showAppView();
                this.loadUserProgress(); // Load from Firestore
            } else {
                this.currentUser = null;
                console.log('No user logged in.');
                this.showAuthView();
            }
        });
    }

    showAuthView() {
        document.getElementById('auth-view').style.display = 'block';
        document.getElementById('questions-view').style.display = 'none';
        document.getElementById('performance-view').style.display = 'none';

        // Hide filters button/nav if needed, or just overlay
        document.querySelector('.main-nav').style.display = 'none';
    }

    showAppView() {
        document.getElementById('auth-view').style.display = 'none';
        document.getElementById('questions-view').style.display = 'block';
        document.querySelector('.main-nav').style.display = 'flex';

        // Trigger initial render if data is ready
        if (this.allQuestions.length > 0) {
            this.applyFilters();
        }
    }

    async loadUserProgress() {
        if (!this.currentUser) return;

        try {
            const docRef = firebase.firestore().collection('users').doc(this.currentUser.uid);
            const doc = await docRef.get();

            if (doc.exists) {
                const data = doc.data();
                this.userProgress = data.progress || {};
                console.log('Progress loaded from Firestore.');

                // Refresh View
                if (this.allQuestions.length > 0) this.applyFilters();
            } else {
                console.log('No existing progress found for user.');
                this.userProgress = {};
            }
        } catch (error) {
            console.error('Error loading progress:', error);
            this.showError('Erro ao carregar progresso da nuvem.');
        }
    }

    async saveUserProgress() {
        // Save locally for immediate feedback
        localStorage.setItem('userProgress_v2', JSON.stringify(this.userProgress));

        if (this.currentUser) {
            // Debounce or just save directly (Firestore writes are cheap enough for this volume)
            try {
                await firebase.firestore().collection('users').doc(this.currentUser.uid).set({
                    progress: this.userProgress,
                    lastUpdated: new Date()
                }, { merge: true });
                console.log('Progress saved to Firestore.');
            } catch (error) {
                console.error('Error saving to Firestore:', error);
            }
        }
    }

    async loadQuestionsFromJSON() {
        try {
            // Taxonomia (com timeout para não travar)
            if (window.taxonomyManager) {
                const taxPromise = window.taxonomyManager.loadTaxonomy();
                const timeoutPromise = new Promise(r => setTimeout(r, 2000)); // 2s timeout
                
                await Promise.race([taxPromise, timeoutPromise]);
                console.log('App: Tentativa de carga da taxonomia concluída.');
            }

            // Retry mechanism for loading large DB
            let retries = 0;
            const maxRetries = 20; // 10s

            const waitForDB = () => {
                return new Promise((resolve, reject) => {
                    const check = () => {
                        // Debug visual (remover em prod, mas útil agora)
                        const countEl = document.getElementById('questions-found-count');
                        if(countEl && retries > 0) countEl.innerText = `(Carregando DB... ${retries})`;

                        if (window.OFFLINE_QUESTIONS && Array.isArray(window.OFFLINE_QUESTIONS)) {
                            resolve(window.OFFLINE_QUESTIONS);
                        } else {
                            retries++;
                            if (retries >= maxRetries) {
                                reject(new Error('Timeout: questions_db.js não definiu window.OFFLINE_QUESTIONS'));
                            } else {
                                setTimeout(check, 500);
                            }
                        }
                    };
                    check();
                });
            };

            const questions = await waitForDB();
            
            const uniqueQuestions = Array.from(new Map(questions.map(q => [q.id, q])).values());
            console.log(`DB Carregado: ${uniqueQuestions.length} questões.`);

            this.allQuestions = window.taxonomyManager.enrichQuestionsWithTaxonomy(uniqueQuestions);
            
            // Critical check for filters reload
            this.processQuestions();
            this.populateFilters();
            
            // If user is already on app view, apply filters now
            if (document.getElementById('questions-view').style.display !== 'none') {
                this.applyFilters();
            }
            
            this.showSuccess(`✅ ${this.allQuestions.length} questões carregadas.`);

        } catch (error) {
            console.error('Erro fatal:', error);
            this.showError('Erro ao carregar banco de dados (Verifique se o arquivo size > 40MB foi carregado).');
        }
    }
        } catch (error) {
            console.error('Erro fatal:', error);
            this.showError('Erro ao inicializar.');
        }
    }

    processQuestions() {
        this.allQuestions.forEach(q => {
            if (q.alternatives && q.alternatives.length === 2) {
                const textA = q.alternatives[0].text.toLowerCase();
                if (textA.includes('certo') || textA.includes('errado') || textA.includes('verdadeiro')) {
                    q.type = 'certo-errado';
                } else {
                    q.type = 'multipla';
                }
            } else {
                q.type = 'multipla';
            }
        });
    }

    populateFilters() {
        const getUniqueExcludingEmpty = (key) => {
            const values = new Set(this.allQuestions.map(q => q[key]).filter(v => v));
            return Array.from(values).sort();
        };

        const mapToOptions = (list) => list.map(item => ({ value: item, label: item, checked: false }));

        const disciplines = getUniqueExcludingEmpty('discipline');
        this.filters.discipline = new MultiSelect(
            'discipline-filter',
            'Selecione as disciplinas',
            mapToOptions(disciplines),
            () => { this.updateSubjectFilters(); this.applyFilters(); }
        );

        this.filters.subject = new MultiSelect('subject-filter', 'Selecione os assuntos', []);
        this.updateSubjectFilters();

        const bancas = getUniqueExcludingEmpty('banca');
        this.filters.banca = new MultiSelect('banca-filter', 'Selecione as bancas', mapToOptions(bancas), () => this.applyFilters());

        const years = new Set(this.allQuestions.map(q => q.year).filter(y => y));
        const sortedYears = Array.from(years).sort((a, b) => b - a);
        this.filters.year = new MultiSelect('year-filter', 'Selecione os anos', mapToOptions(sortedYears), () => this.applyFilters());

        const modalidades = [
            { value: 'multipla', label: 'Múltipla Escolha', checked: false },
            { value: 'certo-errado', label: 'Certo/Errado', checked: false }
        ];
        this.filters.modalidade = new MultiSelect('modalidade-filter', 'Selecione a modalidade', modalidades, () => this.applyFilters());
    }

    updateSubjectFilters() {
        const selectedDisciplines = this.filters.discipline ? this.filters.discipline.getSelectedValues() : [];
        let options = [];

        if (selectedDisciplines.length === 0) {
            const subjectsSet = new Set();
            this.allQuestions.forEach(q => {
                if (q.subjects) q.subjects.forEach(s => subjectsSet.add(s));
            });
            options = Array.from(subjectsSet).sort().map(s => ({ value: s, label: s, checked: false }));
        } else {
            if (window.taxonomyManager) {
                selectedDisciplines.forEach(disc => {
                    const subjects = window.taxonomyManager.getSubjectsForDiscipline(disc);
                    subjects.forEach(s => {
                        if (!options.some(o => o.value === s.value)) {
                            options.push({ ...s, checked: false });
                        }
                    });
                });
            } else {
                const subjectsSet = new Set();
                this.allQuestions.filter(q => selectedDisciplines.includes(q.discipline)).forEach(q => {
                    if (q.subjects) q.subjects.forEach(s => subjectsSet.add(s));
                });
                options = Array.from(subjectsSet).sort().map(s => ({ value: s, label: s, checked: false }));
            }
        }

        if (this.filters.subject) {
            this.filters.subject.setOptions(options);
        }
    }

    applyFilters() {
        const selDisciplines = this.filters.discipline ? this.filters.discipline.getSelectedValues() : [];
        const selSubjects = this.filters.subject ? this.filters.subject.getSelectedValues() : [];
        const selBancas = this.filters.banca ? this.filters.banca.getSelectedValues() : [];
        const selYears = this.filters.year ? this.filters.year.getSelectedValues() : [];
        const selModalidades = this.filters.modalidade ? this.filters.modalidade.getSelectedValues() : [];

        const statusFilter = document.getElementById('status-filter').value;
        const commentsFilter = document.getElementById('comments-filter').value;
        const performanceFilter = document.getElementById('performance-filter').value;

        let filtered = this.allQuestions.filter(q => {
            if (selDisciplines.length > 0 && !selDisciplines.includes(q.discipline)) return false;

            if (selSubjects.length > 0) {
                if (!q.subjects || q.subjects.length === 0) return false;
                const matches = selSubjects.some(sel => {
                    const cleanSel = sel.toLowerCase();
                    return q.subjects.some(sub => sub.toLowerCase().includes(cleanSel) || cleanSel.includes(sub.toLowerCase()));
                });
                if (!matches) return false;
            }

            if (selBancas.length > 0 && !selBancas.includes(q.banca)) return false;
            if (selYears.length > 0 && !selYears.includes(String(q.year))) return false;
            if (selModalidades.length > 0) {
                if (!selModalidades.includes(q.type)) return false;
            }

            const progress = this.userProgress[q.id] || {};

            if (statusFilter === 'answered' && !progress.status) return false;
            if (statusFilter === 'unanswered' && progress.status) return false;

            const hasComment = progress.comments && progress.comments.trim().length > 0;
            if (commentsFilter === 'commented' && !hasComment) return false;
            if (commentsFilter === 'uncommented' && hasComment) return false;

            if (performanceFilter === 'correct' && progress.status !== 'correct') return false;
            if (performanceFilter === 'incorrect' && progress.status !== 'incorrect') return false;

            return true;
        });

        // SORTING LOGIC
        if (this.sortSettings.pedagogical) {
            this.filteredQuestions = this.sortPedagogical(filtered);
        } else {
            // Default: Year Descending
            this.filteredQuestions = filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
        }

        this.currentQuestionIndex = 0;
        this.currentPage = 1;
        this.renderQuestions();
        this.updateStats();
    }

    sortPedagogical(list) {
        let result = [];
        const MAX_INDEX = '9999';

        list.forEach(q => {
            const subjects = q.enrichedSubjects || [];

            if (subjects.length === 0) {
                result.push({ ...q, _sortIndex: MAX_INDEX });
                return;
            }

            if (this.sortSettings.repeat) {
                let added = false;
                subjects.forEach(sub => {
                    const taxNode = (sub.taxonomy && sub.taxonomy.number) ? sub.taxonomy : null;
                    const sortIdx = taxNode ? taxNode.number : MAX_INDEX;

                    result.push({
                        ...q,
                        _sortIndex: sortIdx,
                        _pedagogicalContext: sub.original,
                        _sortTaxonomy: taxNode
                    });
                    added = true;
                });
                if (!added) result.push({ ...q, _sortIndex: MAX_INDEX });

            } else {
                let bestSortIdx = MAX_INDEX;
                let bestTaxon = null;
                const validSubjects = subjects.filter(s => s.taxonomy && s.taxonomy.number);

                if (validSubjects.length > 0) {
                    validSubjects.sort((a, b) => a.taxonomy.number.localeCompare(b.taxonomy.number, undefined, { numeric: true }));

                    const bestSub = this.sortSettings.priority === 'min' ? validSubjects[0] : validSubjects[validSubjects.length - 1];
                    bestSortIdx = bestSub.taxonomy.number;
                    bestTaxon = bestSub.taxonomy;
                }
                result.push({ ...q, _sortIndex: bestSortIdx, _sortTaxonomy: bestTaxon });
            }
        });

        result.sort((a, b) => {
            const idxCompare = a._sortIndex.localeCompare(b._sortIndex, undefined, { numeric: true });
            if (idxCompare !== 0) return idxCompare;
            return (b.year || 0) - (a.year || 0);
        });

        return result;
    }

    exportToMarkdown() {
        if (!this.filteredQuestions || this.filteredQuestions.length === 0) {
            this.showError('Nenhuma questão para exportar.');
            return;
        }

        let md = '';
        let lastHeaderPath = '';

        this.filteredQuestions.forEach((q, index) => {
            let headerPrinted = false;

            // --- HEADER GENERATION ---
            if (this.sortSettings.pedagogical) {
                const currentTaxonomy = q._sortTaxonomy || null;
                const currentDiscipline = q.discipline || 'Geral';
                let currentPath = currentDiscipline;

                if (currentTaxonomy) {
                    const taxPath = currentTaxonomy.fullPath || currentTaxonomy.name;
                    currentPath += ' > ' + taxPath;
                }

                if (currentPath !== lastHeaderPath) {
                    const parts = currentPath.split(' > ');
                    const lastParts = lastHeaderPath.split(' > ');

                    // Break before Header (only if not start of file)
                    if (md.length > 0) md += '\n[[Page-Break]]\n';

                    if (parts[0] !== lastParts[0] && parts[0]) md += `\n# ${parts[0]}\n`;
                    if (parts.length > 1 && (parts[1] !== lastParts[1] || parts[0] !== lastParts[0])) md += `\n## ${parts[1]}\n`;
                    if (parts.length > 2 && (parts[2] !== lastParts[2] || parts[1] !== lastParts[1])) md += `\n### ${parts[2]}\n`;

                    lastHeaderPath = currentPath;
                    md += '\n***\n';
                    headerPrinted = true;
                }
            }

            // --- QUESTION BODY ---
            // If we just printed a header, don't break again (keep title with question)
            // Otherwise, break to separate from previous answer
            if (!headerPrinted) {
                md += `\n[[Page-Break]]\n\n`;
            } else {
                md += `\n\n`; // Just spacing
            }

            const qUrl = q.question_url || ('https://www.qconcursos.com/questoes-de-concursos/questoes/' + q.id);
            md += `#### Questão ${index + 1} ([${q.id}](${qUrl}))\n`;
            md += `> ${q.banca} - ${q.year} - ${q.orgao || 'Não informado'}\n\n`;

            let enunciated = this.cleanEnunciation(q.enunciation);
            md += `${enunciated}\n\n`;

            if (q.alternatives) {
                q.alternatives.forEach(alt => {
                    md += `**${alt.letter})** ${this.cleanEnunciation(alt.text)}\n\n`;
                });
            }

            md += `\n[[Page-Break]]\n\n`;
            md += `**Gabarito: ${q.answer_key}**\n\n`;
        });

        this.downloadFile(md, `questoes_export_${new Date().toISOString().slice(0, 10)}.md`, 'text/markdown');
        this.showSuccess(`Arquivo Markdown gerado com ${this.filteredQuestions.length} questões!`);
    }

    exportToDocx() {
        if (!this.filteredQuestions || this.filteredQuestions.length === 0) {
            this.showError('Nenhuma questão para exportar.');
            return;
        }

        // Microsoft Word 365 compatible HTML wrapper
        let html = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset="utf-8">
            <title>Exportação de Questões</title>
            <!--[if gte mso 9]>
            <xml>
            <w:WordDocument>
                <w:View>Print</w:View>
                <w:Zoom>100</w:Zoom>
                <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
            </xml>
            <![endif]-->
            <style>
                /* Page Setup */
                @page Section1 {
                    size: 595.3pt 841.9pt; /* A4 */
                    margin: 1.0in 1.0in 1.0in 1.0in;
                    mso-header-margin: 35.4pt;
                    mso-footer-margin: 35.4pt;
                    mso-paper-source: 0;
                    mso-footer: f1; /* Link to Footer */
                }
                div.Section1 { page: Section1; }

                /* Generic Styles */
                body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; }
                p { margin: 0pt; margin-bottom: 10pt; }

                /* Headers - Centered */
                h1 { font-size: 16pt; color: #2C3E50; margin-top: 14pt; margin-bottom: 10pt; page-break-after: avoid; text-align: center; }
                h2 { font-size: 14pt; color: #34495E; margin-top: 12pt; margin-bottom: 10pt; page-break-after: avoid; text-align: center; }
                h3 { font-size: 12pt; color: #7F8C8D; margin-top: 10pt; margin-bottom: 8pt; page-break-after: avoid; text-align: center; }

                /* Question Styles - LEFT ALIGNED */
                .question-block { margin-bottom: 20pt; text-align: left; }
                .q-header { font-weight: bold; background-color: #f0f0f0; padding: 5pt; margin-bottom: 8pt; text-align: left; }
                .enunciation { margin-bottom: 10pt; text-align: left; }
                .alternatives { margin-left: 10pt; text-align: left; }
                .alt-item { margin-bottom: 6pt; }
                
                /* Gabarito - CENTERED */
                .gabarito { font-weight: bold; font-size: 12pt; margin-top: 15pt; text-align: center; padding: 10pt; }
                
                /* Footer Style */
                p.MsoFooter, li.MsoFooter, div.MsoFooter {
                    margin: 0pt;
                    margin-bottom: 0.0001pt;
                    mso-pagination: widow-orphan;
                    tab-stops: center 216.0pt right 432.0pt;
                    font-size: 11.0pt;
                    text-align: center;
                }
            </style>
        </head>
        <body>
        <div class="Section1">
        `;

        let lastHeaderPath = '';

        this.filteredQuestions.forEach((q, index) => {
            let headerPrinted = false;

            // Headers Logic
            if (this.sortSettings.pedagogical) {
                const currentTaxonomy = q._sortTaxonomy || null;
                const currentDiscipline = q.discipline || 'Geral';
                let currentPath = currentDiscipline;

                if (currentTaxonomy) {
                    const taxPath = currentTaxonomy.fullPath || currentTaxonomy.name;
                    currentPath += ' > ' + taxPath;
                }

                if (currentPath !== lastHeaderPath) {
                    const parts = currentPath.split(' > ');
                    const lastParts = lastHeaderPath.split(' > ');

                    // Page break for new major sections if not at start
                    if (html.length > 2000) html += '<br style="page-break-before:always" />';

                    html += '<div class="header-block">';
                    if (parts[0] !== lastParts[0] && parts[0]) html += `<h1>${parts[0]}</h1>`;
                    if (parts.length > 1 && (parts[1] !== lastParts[1] || parts[0] !== lastParts[0])) html += `<h2>${parts[1]}</h2>`;
                    if (parts.length > 2 && (parts[2] !== lastParts[2] || parts[1] !== lastParts[1])) html += `<h3>${parts[2]}</h3>`;
                    html += '</div>';

                    lastHeaderPath = currentPath;
                    headerPrinted = true;
                }
            }

            // Page Break before Question (if not section start)
            if (!headerPrinted && index > 0) {
                html += `<br style="page-break-before:always" />`;
            }

            const qUrl = q.question_url || ('https://www.qconcursos.com/questoes-de-concursos/questoes/' + q.id);
            html += `<div class="question-block">`;
            html += `<div class="q-header">Questão ${index + 1} (<a href="${qUrl}">${q.id}</a>)</div>`;
            html += `<p><i>${q.banca} - ${q.year} - ${q.orgao || 'Não informado'}</i></p>`;

            let htmlEn = this.markdownToHtml(this.cleanEnunciation(q.enunciation));
            html += `<div class="enunciation">${htmlEn}</div>`;

            if (q.alternatives) {
                html += `<div class="alternatives">`;
                q.alternatives.forEach(alt => {
                    let htmlAlt = this.markdownToHtml(this.cleanEnunciation(alt.text));
                    html += `<div class="alt-item"><b>${alt.letter})</b> ${htmlAlt}</div>`;
                });
                html += `</div>`;
            }

            // Gabarito Centered
            html += `<br style="page-break-before:always" />`;
            html += `<div class="gabarito">Gabarito: ${q.answer_key}</div>`;
            html += `</div>`;
        });

        html += `
        </div> <!-- End Section1 -->
        
        <!-- FOOTER DEFINITION FOR WORD -->
        <div style="mso-element:footer" id="f1">
            <p class="MsoFooter" align="center" style="text-align:center">
                <span style="font-family:Calibri, sans-serif; font-size:11pt">
                    <a href="https://www.instagram.com/_gilson.nogueira_" style="text-decoration:none; color:black">@_gilson.nogueira_</a>
                </span>
            </p>
        </div>

        <!-- FOOTER FOR LIBREOFFICE/BROWSERS -->
        <div style="position: fixed; bottom: 0; width: 100%; text-align: center; background: white; border-top: 1px solid #ccc; padding: 5px;">
             <p style='text-align:center; margin:0;'>
                <a href="https://www.instagram.com/_gilson.nogueira_" style="text-decoration:none; color:black">@_gilson.nogueira_</a>
            </p>
        </div>
        
        </body>
        </html>`;

        // CHANGED TO .DOC for compatibility. plain HTML in .docx is invalid.
        this.downloadFile(html, `questoes_export_${new Date().toISOString().slice(0, 10)}.doc`, 'application/msword');
        this.showSuccess(`Arquivo DOCX (HTML Compatível) gerado!`);
    }

    markdownToHtml(text) {
        if (!text) return '';
        let t = text;
        t = t.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        t = t.replace(/\*(.*?)\*/g, '<i>$1</i>');
        t = t.replace(/\n/g, '<br>');
        return t;
    }

    cleanEnunciation(text) {
        if (!text) return '';
        return text;
    }

    downloadFile(content, fileName, mimeType = 'text/markdown') {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    clearFilters() {
        if (this.filters.discipline) this.filters.discipline.clearSelection();
        if (this.filters.subject) this.filters.subject.clearSelection();
        if (this.filters.banca) this.filters.banca.clearSelection();
        if (this.filters.year) this.filters.year.clearSelection();
        if (this.filters.modalidade) this.filters.modalidade.clearSelection();

        document.getElementById('status-filter').value = 'all';
        document.getElementById('comments-filter').value = 'all';
        document.getElementById('performance-filter').value = 'all';

        this.applyFilters();
    }

    renderQuestions() {
        const container = document.getElementById('questions-list');
        const start = (this.currentPage - 1) * this.questionsPerPage;
        const end = start + this.questionsPerPage;
        const list = this.filteredQuestions.slice(start, end);

        const countBadge = document.getElementById('questions-found-count');
        if (countBadge) countBadge.textContent = `(${this.filteredQuestions.length})`;

        if (list.length === 0) {
            container.innerHTML = `
                <div style="padding: 40px; text-align: center; color: var(--text-secondary);">
                    <h3>Nenhuma questão encontrada</h3>
                    <p>Tente ajustar seus filtros de busca.</p>
                </div>`;
            this.updatePagination(0);
            return;
        }

        container.innerHTML = list.map(q => this.createQuestionCardHTML(q)).join('');

        this.attachCardEvents(container, list);
        this.updatePagination(Math.ceil(this.filteredQuestions.length / this.questionsPerPage));

        // CRITICAL FIX: Restore focus visuals if we are in focus mode
        // When the DOM is rebuilt, the 'focused' class is lost, but the body class persists.
        if (document.body.classList.contains('focus-mode-active')) {
            if (this.currentFocusIndex >= 0 && this.currentFocusIndex < list.length) {
                const cards = container.querySelectorAll('.question-card');
                if (cards[this.currentFocusIndex]) {
                    cards[this.currentFocusIndex].classList.add('focused');
                    // Ensure it stays visible
                    // cards[this.currentFocusIndex].scrollIntoView({ behavior: 'auto', block: 'center' });
                }
            } else {
                // If index is somehow invalid, just exit focus mode to avoid "gray screen" trap
                this.exitFocusMode();
            }
        }
    }

    extractCargo(q) {
        if (!q.prova) return '';

        let text = q.prova;

        // Remove known components to isolate the Cargo
        if (q.banca) text = text.replace(q.banca, '');
        if (q.year) text = text.replace(String(q.year), '');
        if (q.orgao) text = text.replace(q.orgao, '');

        // Cleanup separators
        return text.replace(/^[ \-–]+|[ \-–]+$/g, '').trim();
    }

    createQuestionCardHTML(q) {
        const progress = this.userProgress[q.id] || {};
        const isAnswered = !!progress.status;
        const hasComment = progress.comments && progress.comments.trim().length > 0;

        // CHIPS ROW (Banca, Year, Orgao, Pedagogical)
        let visualBadges = '';

        // Pedagogical Context first if exists (it's important)
        if (q._pedagogicalContext) {
            visualBadges += `<span class="badge" style="background:var(--primary-light); color:var(--primary); border:1px solid var(--primary);">📂 ${q._pedagogicalContext}</span>`;
        }

        visualBadges += `
            <span class="badge badge-banca">${q.banca}</span>
            <span class="badge badge-year">${q.year}</span>
        `;

        if (q.orgao) {
            visualBadges += `<span class="badge badge-orgao">${q.orgao}</span>`;
        }

        // CARGO (Separate logic)
        const cargo = this.extractCargo(q);
        let cargoHTML = '';
        if (cargo && cargo.length > 2) {
            cargoHTML = `<div class="q-cargo-row">💼 <span class="cargo-text">${cargo}</span></div>`;
        }

        // STATUS BADGE (Right aligned)
        let statusBadge = '';
        if (hasComment) statusBadge += `<span class="badge badge-status commented">💬 Comentada</span>`;

        if (!isAnswered) {
            statusBadge += `<span class="badge badge-status unanswered">⚪ Não Respondida</span>`;
        } else {
            if (progress.status === 'correct') statusBadge += `<span class="badge badge-status answered">✅ Acertou</span>`;
            else statusBadge += `<span class="badge badge-status unanswered" style="background:var(--error-light);color:var(--error);border-color:var(--error-light);">❌ Errou</span>`;
        }

        const alternativesHTML = q.alternatives.map(alt => {
            let itemClass = 'alternative-item';
            let feedbackClass = '';

            if (isAnswered) {
                if (alt.letter === q.answer_key) feedbackClass = 'alt-correct';
                if (alt.letter === progress.userAnswer && progress.status === 'incorrect') feedbackClass = 'alt-incorrect';
            }

            const isSelected = progress.userAnswer === alt.letter;
            if (isSelected) itemClass += ' selected';

            return `
                <div class="${itemClass} ${feedbackClass}" data-letter="${alt.letter}">
                    <div class="alt-letter">${alt.letter}</div>
                    <div class="alt-text">${alt.text}</div>
                    <button class="btn-eliminate" title="Tachar alternativa">✂️</button>
                </div>
            `;
        }).join('');

        const commentsHTML = `
            <div class="q-comments-area ${hasComment ? 'active' : ''}" id="comments-${q.id}">
                <div class="user-comment-box" id="editor-container-${q.id}">
                    <div class="editor-toolbar">
                        <button type="button" class="toolbar-btn" data-action="bold" title="Negrito"><b>B</b></button>
                        <button type="button" class="toolbar-btn" data-action="italic" title="Itálico"><i>I</i></button>
                        <button type="button" class="toolbar-btn" data-action="underline" title="Sublinhado"><u>U</u></button>
                        <div class="toolbar-divider"></div>
                        
                        <button type="button" class="toolbar-btn" data-action="color-red" title="Vermelho"><span style="color:#ef4444; font-size:1.2em;">●</span></button>
                        <button type="button" class="toolbar-btn" data-action="color-green" title="Verde"><span style="color:#10b981; font-size:1.2em;">●</span></button>
                        <button type="button" class="toolbar-btn" data-action="color-blue" title="Azul"><span style="color:#3b82f6; font-size:1.2em;">●</span></button>
                        <button type="button" class="toolbar-btn" data-action="color-black" title="Preto"><span style="color:#000000; font-size:1.2em;">●</span></button>
                        <div class="toolbar-divider"></div>
                        
                        <button type="button" class="toolbar-btn" data-action="ul" title="Lista">UL</button>
                        <button type="button" class="toolbar-btn" data-action="ol" title="Numeração">OL</button>
                        <button type="button" class="toolbar-btn" data-action="quote" title="Citação">“</button>
                        <button type="button" class="toolbar-btn" data-action="code" title="Código">&lt;&gt;</button>
                    </div>
                    <textarea class="comment-textarea" placeholder="Escreva suas anotações...">${progress.comments || ''}</textarea>
                    <div class="comment-actions">
                        <button class="btn btn-primary btn-save-comment">Salvar Nota</button>
                    </div>
                </div>
            </div>
        `;

        return `
            <div class="question-card" data-id="${q.id}">
                <div class="q-header">
                    <div class="q-top-row">
                         <div class="q-title-group">
                            <span class="q-id">${q.id}</span>
                            <span class="q-divider">|</span>
                            <span class="q-discipline">${q.discipline}</span>
                         </div>
                         <div class="q-status-group">
                            ${statusBadge}
                         </div>
                    </div>
                    
                    <div class="q-meta-chips">
                        ${visualBadges}
                    </div>

                    ${cargoHTML}

                    <div class="q-breadcrumbs">${(q.subjects || []).join(' > ')}</div>
                </div>
                <div class="q-enunciation">${q.enunciation}</div>
                <div class="q-alternatives">${alternativesHTML}</div>
                <div class="q-footer">
                    <div style="display: flex; gap: 16px; align-items: center;">
                        <button class="btn-toggle-comments">💬 ${hasComment ? 'Ver/Editar Comentários' : 'Adicionar Comentário'}</button>
                        <a href="${q.question_url || 'https://www.qconcursos.com/questoes-de-concursos/questoes/' + q.id}" target="_blank" class="btn-link-qc" title="Abrir no QConcursos">
                            🔗 Ver no QC
                        </a>
                    </div>
                     ${!isAnswered ? '<button class="btn btn-primary btn-respond" disabled>Responder</button>' : ''}
                </div>
                ${commentsHTML}
            </div>
        `;
    }

    attachCardEvents(container, questions) {
        questions.forEach(q => {
            const card = container.querySelector(`.question-card[data-id="${q.id}"]`);
            if (!card) return;

            const alts = card.querySelectorAll('.alternative-item');
            const respondBtn = card.querySelector('.btn-respond');

            alts.forEach(alt => {
                alt.addEventListener('click', (e) => {
                    // Ignore clicks on eliminate button (handled separately)
                    if (e.target.closest('.btn-eliminate')) return;

                    const progress = this.userProgress[q.id];
                    if (progress && progress.status) return;

                    alts.forEach(a => a.classList.remove('selected'));
                    alt.classList.add('selected');
                    if (respondBtn) respondBtn.disabled = false;
                });

                const eliminateBtn = alt.querySelector('.btn-eliminate');
                if (eliminateBtn) {
                    eliminateBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        alt.classList.toggle('eliminated');
                    });
                }
            });

            if (respondBtn) {
                respondBtn.addEventListener('click', () => {
                    const selected = card.querySelector('.alternative-item.selected');
                    if (selected) {
                        this.handleAnswer(q, selected.dataset.letter);
                    }
                });
            }

            const toggleComment = card.querySelector('.btn-toggle-comments');
            const commentArea = card.querySelector('.q-comments-area');
            toggleComment.addEventListener('click', () => {
                const isActive = commentArea.classList.toggle('active');
                if (isActive && !card.dataset.editorInit && window.MarkdownEditor) {
                    new MarkdownEditor(`editor-container-${q.id}`);
                    card.dataset.editorInit = 'true';
                }
            });

            const saveBtn = card.querySelector('.btn-save-comment');
            const textarea = card.querySelector('textarea');
            saveBtn.addEventListener('click', () => {
                this.saveComment(q.id, textarea.value);
            });
        });
    }

    handleAnswer(question, answerLetter) {
        const isCorrect = answerLetter === question.answer_key;
        if (!this.userProgress[question.id]) this.userProgress[question.id] = {};
        this.userProgress[question.id].status = isCorrect ? 'correct' : 'incorrect';
        this.userProgress[question.id].userAnswer = answerLetter;
        this.userProgress[question.id].answeredAt = new Date().toISOString();
        this.saveUserProgress();
        this.renderQuestions();

        // Animations
        if (isCorrect) {
            this.triggerConfetti();
        } else {
            this.triggerShake(question.id);
        }
    }

    triggerConfetti() {
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            document.body.appendChild(confetti);

            const left = Math.random() * 100 + 'vw';
            const animDuration = Math.random() * 3 + 2 + 's';
            const bg = colors[Math.floor(Math.random() * colors.length)];

            confetti.style.left = left;
            confetti.style.backgroundColor = bg;
            confetti.style.animationDuration = animDuration;

            // Cleanup
            setTimeout(() => confetti.remove(), 5000);
        }
    }

    triggerShake(qId) {
        const card = document.querySelector(`.question-card[data-id="${qId}"]`);
        if (card) {
            card.classList.add('shake-animation');
            card.addEventListener('animationend', () => {
                card.classList.remove('shake-animation');
            }, { once: true });
        }
    }

    saveComment(qId, text) {
        if (!this.userProgress[qId]) this.userProgress[qId] = {};
        this.userProgress[qId].comments = text;
        this.saveUserProgress();
        this.showSuccess('Comentário salvo');
        this.renderQuestions();
    }

    updatePagination(totalPages) {
        const container = document.getElementById('page-numbers');
        container.innerHTML = '';

        const createPageBtn = (page, isActive = false) => {
            const btn = document.createElement('div');
            btn.className = `page-number ${isActive ? 'active' : ''}`;
            btn.textContent = page;
            btn.onclick = () => {
                if (this.currentPage !== page) {
                    this.currentPage = page;
                    this.changePage();
                }
            };
            return btn;
        };

        const createDots = () => {
            const span = document.createElement('span');
            span.className = 'page-dots';
            span.textContent = '...';
            return span;
        };

        // Smart Pagination Logic
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                container.appendChild(createPageBtn(i, i === this.currentPage));
            }
        } else {
            // Always show first
            container.appendChild(createPageBtn(1, 1 === this.currentPage));

            if (this.currentPage > 3) {
                container.appendChild(createDots());
            }

            // Neighbors
            let start = Math.max(2, this.currentPage - 1);
            let end = Math.min(totalPages - 1, this.currentPage + 1);

            // Adjust if near start or end to keep constant number of items approximately
            if (this.currentPage <= 3) {
                end = 4;
            }
            if (this.currentPage >= totalPages - 2) {
                start = totalPages - 3;
            }

            for (let i = start; i <= end; i++) {
                container.appendChild(createPageBtn(i, i === this.currentPage));
            }

            if (this.currentPage < totalPages - 2) {
                container.appendChild(createDots());
            }

            // Always show last
            container.appendChild(createPageBtn(totalPages, totalPages === this.currentPage));
        }

        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        // Update Button States and Content
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
            prevBtn.innerHTML = '‹ Anterior'; // Using chevron
            prevBtn.onclick = () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.changePage();
                }
            };
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages;
            nextBtn.innerHTML = 'Próxima ›';
            nextBtn.onclick = () => {
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.changePage();
                }
            };
        }
    }

    changePage() {
        this.currentFocusIndex = -1;
        if (document.body.classList.contains('focus-mode-active')) this.exitFocusMode();
        this.renderQuestions();
        window.scrollTo(0, 0);
    }

    updateStats() {
        const total = this.allQuestions.length;
        const answered = Object.values(this.userProgress).filter(p => p.status).length;
        const correct = Object.values(this.userProgress).filter(p => p.status === 'correct').length;
        const rate = answered ? Math.round((correct / answered) * 100) : 0;

        const elTotal = document.getElementById('total-questions-stats');
        if (elTotal) elTotal.textContent = total;
        const elAns = document.getElementById('total-answered-stats');
        if (elAns) elAns.textContent = answered;
        const elRate = document.getElementById('success-rate-stats');
        if (elRate) elRate.textContent = `${rate}%`;
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore key events if typing in an input or textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // PAGE NAVIGATION (Ctrl + Shift + Arrows)
            if (e.ctrlKey && e.shiftKey) {
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    if (this.currentPage < Math.ceil(this.filteredQuestions.length / this.questionsPerPage)) {
                        this.currentFocusIndex = -1; // Reset focus
                        if (document.body.classList.contains('focus-mode-active')) this.exitFocusMode();
                        document.getElementById('next-page').click();
                    }
                    return;
                }
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    if (this.currentPage > 1) {
                        this.currentFocusIndex = -1; // Reset focus
                        if (document.body.classList.contains('focus-mode-active')) this.exitFocusMode();
                        document.getElementById('prev-page').click();
                    }
                    return;
                }
            }

            // QUESTION NAVIGATION (Ctrl + Arrows)
            if (e.ctrlKey && !e.shiftKey) {
                const questions = document.querySelectorAll('.question-card');
                if (questions.length === 0) return;

                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    if (this.currentFocusIndex < questions.length - 1) {
                        this.currentFocusIndex++;
                        this.updateFocusVisuals();
                    }
                    return;
                }
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    if (this.currentFocusIndex > 0) {
                        this.currentFocusIndex--;
                        this.updateFocusVisuals();
                    } else if (this.currentFocusIndex === -1) {
                        this.currentFocusIndex = 0;
                        this.updateFocusVisuals();
                    }
                    return;
                }
            }

            // ALTERNATIVE ACTIONS (A-E)
            const key = e.key.toUpperCase();
            if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
                if (this.currentFocusIndex === -1) return; // Only when a question is focused

                const questions = document.querySelectorAll('.question-card');
                const card = questions[this.currentFocusIndex];
                if (!card) return;

                const alt = card.querySelector(`.alternative-item[data-letter="${key}"]`);
                if (!alt) return;

                if (e.shiftKey) {
                    // ELIMINATE (Shift + Letter)
                    const eliminateBtn = alt.querySelector('.btn-eliminate');
                    if (eliminateBtn) eliminateBtn.click();
                } else {
                    // SELECT (Letter)
                    if (!e.ctrlKey && !e.altKey && !e.metaKey) {
                        // Check if question is already answered
                        const qId = card.dataset.id;
                        const progress = this.userProgress[qId];
                        if (!progress || !progress.status) {
                            alt.click();
                        }
                    }
                }
            }

            // RESPOND (Enter)
            if (e.key === 'Enter') {
                if (this.currentFocusIndex === -1) return;
                const questions = document.querySelectorAll('.question-card');
                const card = questions[this.currentFocusIndex];
                if (!card) return;

                const respondBtn = card.querySelector('.btn-respond');
                if (respondBtn && !respondBtn.disabled) respondBtn.click();
            }
        });
    } // End setupKeyboardShortcuts

    async handleLogin(email, password) {
        const errorMsg = document.getElementById('auth-error-msg');
        errorMsg.style.display = 'none';

        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            // Observer in checkAuth will handle the transition
        } catch (error) {
            console.error('Login Error:', error);
            errorMsg.textContent = this.getAuthErrorMessage(error.code);
            errorMsg.style.display = 'block';
        }
    }

    async handleSignUp(email, password) {
        const errorMsg = document.getElementById('auth-error-msg');
        errorMsg.style.display = 'none';

        try {
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            // Create user document in Firestore
            await firebase.firestore().collection('users').doc(userCredential.user.uid).set({
                email: email,
                createdAt: new Date(),
                progress: {}
            });
            // Observer handles transition
        } catch (error) {
            console.error('Signup Error:', error);
            errorMsg.textContent = this.getAuthErrorMessage(error.code);
            errorMsg.style.display = 'block';
        }
    }

    async handleLogout() {
        try {
            await firebase.auth().signOut();
            window.location.reload(); // Reload to clear state cleanly
        } catch (error) {
            console.error('Logout Error:', error);
        }
    }

    getAuthErrorMessage(code) {
        switch (code) {
            case 'auth/invalid-email': return 'Email inválido.';
            case 'auth/user-disabled': return 'Este usuário foi desativado.';
            case 'auth/user-not-found': return 'Usuário não encontrado. Crie uma conta.';
            case 'auth/wrong-password': return 'Senha incorreta.';
            case 'auth/email-already-in-use': return 'Este email já está cadastrado.';
            case 'auth/weak-password': return 'A senha deve ter pelo menos 6 caracteres.';
            default: return 'Erro ao autenticar. Tente novamente.';
        }
    }

        // Click outside to exit focus mode
        document.addEventListener('click', (e) => {
    if (document.body.classList.contains('focus-mode-active')) {
        const focusedCard = document.querySelector('.question-card.focused');

        // If we clicked inside the FOCUSED card (or its children), ignore triggers to exit.
        // This allows interaction with the active question.
        if (focusedCard && focusedCard.contains(e.target)) {
            return;
        }

        // If we clicked anywhere else (dimmed background, dimmed card, or if no card is focused), exit focus mode.
        this.exitFocusMode();
    }
});
    }

updateFocusVisuals() {
    const questions = document.querySelectorAll('.question-card');
    document.body.classList.add('focus-mode-active');

    questions.forEach((card, index) => {
        if (index === this.currentFocusIndex) {
            card.classList.add('focused');
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            card.classList.remove('focused');
        }
    });
}

exitFocusMode() {
    document.body.classList.remove('focus-mode-active');
    const questions = document.querySelectorAll('.question-card');
    questions.forEach(card => card.classList.remove('focused'));
    // Keep currentFocusIndex for next continuity or reset?
    // Usually keeping it is better UX.
}

setupEventListeners() {
    document.getElementById('apply-filters').addEventListener('click', () => this.applyFilters());
    document.getElementById('clear-filters').addEventListener('click', () => this.clearFilters());

    const itemsPerPageSelect = document.getElementById('items-per-page');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', (e) => {
            this.questionsPerPage = parseInt(e.target.value);
            this.currentPage = 1;
            this.renderQuestions();
        });
    }

    const toggleFilters = document.getElementById('toggle-filters-btn');
    if (toggleFilters) {
        toggleFilters.addEventListener('click', () => {
            const filtersBody = document.getElementById('filters-body');
            const isHidden = filtersBody.style.display === 'none';
            filtersBody.style.display = isHidden ? 'block' : 'none';
            toggleFilters.textContent = isHidden ? '👁️ Ocultar' : '👁️ Mostrar';
        });
    }

    // --- AUTH EVENTS ---
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('auth-email').value;
            const pass = document.getElementById('auth-password').value;
            const isSignUp = authForm.dataset.mode === 'signup';

            if (isSignUp) {
                this.handleSignUp(email, pass);
            } else {
                this.handleLogin(email, pass);
            }
        });
    }

    const authToggle = document.getElementById('auth-toggle-link');
    if (authToggle) {
        authToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const form = document.getElementById('auth-form');
            const title = document.querySelector('.auth-header h2');
            const subtitle = document.getElementById('auth-subtitle');
            const btn = document.getElementById('btn-auth-submit');
            const toggleText = document.getElementById('auth-toggle-text');

            if (form.dataset.mode === 'signup') {
                // Switch to Login
                form.dataset.mode = 'login';
                title.textContent = 'Bem-vindo ao CQ';
                subtitle.textContent = 'Faça login para sincronizar seu progresso.';
                btn.textContent = 'Entrar';
                toggleText.innerHTML = 'Não tem conta? <a href="#" id="auth-toggle-link">Cadastre-se</a>';
            } else {
                // Switch to SignUp
                form.dataset.mode = 'signup';
                title.textContent = 'Criar Conta';
                subtitle.textContent = 'Registre-se para salvar suas questões e estatísticas.';
                btn.textContent = 'Cadastrar';
                toggleText.innerHTML = 'Já tem conta? <a href="#" id="auth-toggle-link">Fazer Login</a>';
            }

            // Re-attach listener because innerHTML replacement kills it (quick fix logic, better to use delegation but this works for now if we don't replace the parent)
            // Actually innerHTML replaces the link, so we need to target the parent or find the new link.
            // Simple fix: changing only the text parts or getting the new element.
            document.getElementById('auth-toggle-link').addEventListener('click', (ev) => authToggle.click()); // Recursive bind hack or just clean re-bind
        });

        // BETTER TOGGLE LOGIC to avoid event loss
        authToggle.parentNode.addEventListener('click', (e) => {
            if (e.target.id === 'auth-toggle-link') {
                e.preventDefault();
                const form = document.getElementById('auth-form');
                const isSignup = form.dataset.mode === 'signup';

                form.dataset.mode = isSignup ? 'login' : 'signup';
                document.querySelector('.auth-header h2').textContent = isSignup ? 'Bem-vindo ao CQ' : 'Criar Conta';
                document.getElementById('auth-subtitle').textContent = isSignup ? 'Faça login para sincronizar seu progresso.' : 'Registre-se para salvar suas questões e estatísticas.';
                document.getElementById('btn-auth-submit').textContent = isSignup ? 'Entrar' : 'Cadastrar';

                const spanText = isSignup ? 'Não tem conta? ' : 'Já tem conta? ';
                const linkText = isSignup ? 'Cadastre-se' : 'Fazer Login';

                e.target.parentNode.firstChild.textContent = spanText;
                e.target.textContent = linkText;
            }
        });
    }

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => this.handleLogout());
    }

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tab = btn.dataset.tab;
            document.querySelectorAll('.view-section').forEach(v => v.style.display = 'none');

            if (tab === 'questions') document.getElementById('questions-view').style.display = 'block';
            else if (tab === 'performance') document.getElementById('performance-view').style.display = 'block';
        });
    });

    // NEW SORT EVENT LISTENERS
    document.getElementById('toggle-sort-options').addEventListener('click', () => {
        const panel = document.getElementById('sort-options-panel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('sort-pedagogical').addEventListener('change', (e) => {
        this.sortSettings.pedagogical = e.target.checked;
        document.getElementById('pedagogical-suboptions').style.display = e.target.checked ? 'block' : 'none';
        this.applyFilters();
    });

    document.getElementById('sort-repeat').addEventListener('change', (e) => {
        this.sortSettings.repeat = e.target.checked;
        document.getElementById('priority-options').style.display = e.target.checked ? 'none' : 'block';
        this.applyFilters();
    });

    document.querySelectorAll('input[name="sort-priority"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            this.sortSettings.priority = e.target.value;
            this.applyFilters();
        });
    });

    // EXPORT LISTENERS
    const btnExportMD = document.getElementById('btn-export-markdown');
    if (btnExportMD) btnExportMD.addEventListener('click', () => this.exportToMarkdown());

    const btnExportDocx = document.getElementById('btn-export-docx');
    if (btnExportDocx) btnExportDocx.addEventListener('click', () => this.exportToDocx());
}

showSuccess(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;top:20px;right:20px;background:var(--success);color:white;padding:12px 24px;border-radius:8px;z-index:9999;font-weight:600;`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

showError(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;top:20px;right:20px;background:var(--error);color:white;padding:12px 24px;border-radius:8px;z-index:9999;font-weight:600;`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
}

window.addEventListener('load', () => {
    window.questionBank = new QuestionBank();
});
