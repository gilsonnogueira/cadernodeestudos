# Caderno de Estudos - Banco de Questões

Uma interface moderna, elegante e interativa para estudo e resolução de questões de concursos públicos. Este projeto permite carregar bancos de questões locais, filtrar, responder e acompanhar seu desempenho com uma experiência visual premium.

![Preview](./preview.png)

## ✨ Funcionalidades

### 🎯 Resolução Interativa

- **Feedback Visual Instantâneo:** Animações de celebração (Confetti 🎉) ao acertar e vibração (Shake ❌) ao errar.
- **Eliminação de Alternativas:** Ferramenta de tachar (✂️) alternativas incorretas para facilitar a análise.
- **Comentários Pessoais:** Editor de texto rico para fazer anotações em cada questão.

### 🧠 Modo Foco & Atalhos

Navegue e responda sem tirar as mãos do teclado.

- **Navegação:** `Ctrl + Setas` (Questões) | `Ctrl + Shift + Setas` (Páginas).
- **Seleção:** Teclas `A`, `B`, `C`, `D`, `E` para selecionar alternativas.
- **Eliminação:** `Shift + [Letra]` para riscar a alternativa.
- **Responder:** `Enter`.
- **Foco Visual:** Destaque na questão ativa, escurecendo as demais para evitar distrações.

### 📊 Organização e Filtros

- **Metadados Completos:** Visualização clara de Banca, Ano, Órgão e Cargo através de badges coloridos.
- **Filtros Avançados:** Filtre por Disciplina, Assunto, Banca, Ano e Modalidade.
- **Taxonomia Hierárquica:** Suporte a árvore de assuntos para estudos direcionados.

### 📤 Exportação

- **Markdown:** Gere arquivos formatados para aplicativos de notas (Obsidian, Notion).
- **DOCX:** Exporte cadernos de prova formatados para impressão ou edição no Word.
- **Layout de Impressão:** Quebras de página inteligentes e formatação limpa.

### 🚀 Performance

- **Paginação Inteligente:** Navegação rápida entre milhares de questões.
- **Funcionamento Offline:** Todo o processamento é feito no navegador, garantindo velocidade e privacidade.

## 🛠️ Instalação e Uso

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/seu-usuario/cadernodeestudos.git
   ```

2. **Abra o projeto:**
   Basta abrir o arquivo `index.html` em qualquer navegador moderno.

3. **Carregando Questões:**
   O sistema espera um arquivo `questoes.json` estruturado. Caso utilize a extensão auxiliar, basta exportar o banco e atualizar o arquivo de dados.

## ⌨️ Atalhos de Teclado

| Ação | Atalho |
|--------|--------|
| Próxima Questão | `Ctrl` + `→` |
| Questão Anterior | `Ctrl` + `←` |
| Próxima Página | `Ctrl` + `Shift` + `→` |
| Página Anterior | `Ctrl` + `Shift` + `←` |
| Selecionar Alternativa | `A`, `B`, `C`, `D`, `E` |
| Riscar Alternativa | `Shift` + `A`, `B`... |
| Confirmar Resposta | `Enter` |
| Sair do Modo Foco | `Esc` ou Clique fora |

## 🎨 Personalização

O projeto utiliza variáveis CSS modernas (`var(--primary)`, etc.) em `styles.css`, facilitando a personalização de cores e temas.

---
*Desenvolvido para otimizar a rotina de estudos de alto rendimento.*
