// Editor Markdown Rico
// ====================

class MarkdownEditor {
    constructor(containerId, textareaId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.textarea = this.container.querySelector('textarea');
        if (!this.textarea && textareaId) {
            this.textarea = document.getElementById(textareaId);
        }

        this.setupToolbar();
        this.setupKeyboardShortcuts();
    }

    setupToolbar() {
        if (!this.container) return;

        const toolbarButtons = this.container.querySelectorAll('.toolbar-btn');

        toolbarButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.executeAction(action);
            });
        });

        // Preview toggle
        const previewBtn = this.container.querySelector('[data-action="preview"]');
        if (previewBtn) {
            previewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.togglePreview();
            });
        }

        // Close preview
        const closePreviewBtn = this.container.querySelector('.close-preview-btn');
        if (closePreviewBtn) {
            closePreviewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const preview = this.container.querySelector('.comment-preview');
                if (preview) preview.style.display = 'none';
            });
        }
    }

    setupKeyboardShortcuts() {
        if (!this.textarea) return;

        this.textarea.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault();
                        this.executeAction('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.executeAction('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        this.executeAction('underline');
                        break;
                }
            }
        });
    }

    executeAction(action) {
        if (!this.textarea) return;

        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const selectedText = this.textarea.value.substring(start, end);
        const beforeText = this.textarea.value.substring(0, start);
        const afterText = this.textarea.value.substring(end);

        let newText = '';
        let cursorOffset = 0;

        switch (action) {
            case 'bold':
                newText = `**${selectedText || 'texto em negrito'}**`;
                cursorOffset = selectedText ? 2 : -2;
                break;

            case 'italic':
                newText = `*${selectedText || 'texto em itálico'}*`;
                cursorOffset = selectedText ? 1 : -1;
                break;

            case 'underline':
                newText = `<u>${selectedText || 'texto sublinhado'}</u>`;
                cursorOffset = selectedText ? 3 : -4;
                break;

            case 'strikethrough':
                newText = `~~${selectedText || 'texto tachado'}~~`;
                cursorOffset = selectedText ? 2 : -2;
                break;

            case 'h1':
                newText = `# ${selectedText || 'Título 1'}`;
                cursorOffset = selectedText ? 2 : -8;
                break;

            case 'h2':
                newText = `## ${selectedText || 'Título 2'}`;
                cursorOffset = selectedText ? 3 : -8;
                break;

            case 'h3':
                newText = `### ${selectedText || 'Título 3'}`;
                cursorOffset = selectedText ? 4 : -8;
                break;

            case 'ul':
                newText = `- ${selectedText || 'item de lista'}`;
                cursorOffset = selectedText ? 2 : -13;
                break;

            case 'ol':
                newText = `1. ${selectedText || 'item numerado'}`;
                cursorOffset = selectedText ? 3 : -14;
                break;

            case 'quote':
                newText = `> ${selectedText || 'citação'}`;
                cursorOffset = selectedText ? 2 : -8;
                break;

            case 'code':
                newText = `\`${selectedText || 'código'}\``;
                cursorOffset = selectedText ? 1 : -1;
                break;

            case 'codeblock':
                newText = `\`\`\`\n${selectedText || 'bloco de código'}\n\`\`\``;
                cursorOffset = selectedText ? 4 : -4;
                break;

            case 'color-red':
                newText = `<span style="color: #ef4444;">${selectedText || 'texto vermelho'}</span>`;
                cursorOffset = 0;
                break;
            case 'color-green':
                newText = `<span style="color: #10b981;">${selectedText || 'texto verde'}</span>`;
                cursorOffset = 0;
                break;
            case 'color-blue':
                newText = `<span style="color: #3b82f6;">${selectedText || 'texto azul'}</span>`;
                cursorOffset = 0;
                break;
            case 'color-black':
                newText = `<span style="color: #000000;">${selectedText || 'texto preto'}</span>`;
                cursorOffset = 0;
                break;

            case 'link':
                const url = selectedText || 'url';
                newText = `[texto do link](${url})`;
                cursorOffset = selectedText ? 1 : -14;
                break;

            default:
                return;
        }

        // Atualiza o textarea
        this.textarea.value = beforeText + newText + afterText;

        // Reposiciona cursor
        const newCursorPos = start + newText.length + cursorOffset;
        this.textarea.setSelectionRange(newCursorPos, newCursorPos);
        this.textarea.focus();
    }

    togglePreview() {
        if (!this.container) return;

        const preview = this.container.querySelector('.comment-preview');
        const content = this.container.querySelector('.preview-content');

        if (!preview || !content) return;

        if (preview.style.display === 'none' || !preview.style.display) {
            // Mostra preview
            const markdownText = this.textarea.value;
            const html = this.markdownToHTML(markdownText);
            content.innerHTML = html;
            preview.style.display = 'block';
        } else {
            // Esconde preview
            preview.style.display = 'none';
        }
    }

    markdownToHTML(markdown) {
        if (!markdown) return '<p><em>Nenhum conteúdo para visualizar</em></p>';

        let html = markdown;

        // Headers (H1, H2, H3)
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

        // Code blocks
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Bold (**text** ou __text__)
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

        // Italic (*text* ou _text_)
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.+?)_/g, '<em>$1</em>');

        // Strikethrough (~~text~~)
        html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

        // Blockquotes
        html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

        // Links [text](url)
        html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Unordered lists
        html = html.replace(/^\- (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

        // Ordered lists
        html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/gs, (match) => {
            if (!match.includes('<ul>')) {
                return `<ol>${match}</ol>`;
            }
            return match;
        });

        // Line breaks
        html = html.replace(/\n/g, '<br>');

        // Paragraphs
        html = html.replace(/(<br>){2,}/g, '</p><p>');

        if (!html.startsWith('<h1>') && !html.startsWith('<h2>') && !html.startsWith('<h3>')) {
            html = `<p>${html}</p>`;
        }

        return html;
    }

    getValue() {
        return this.textarea ? this.textarea.value : '';
    }

    setValue(value) {
        if (this.textarea) this.textarea.value = value;
    }
}
