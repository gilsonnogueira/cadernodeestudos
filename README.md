# 🎯 Banco de Questões - Sistema Completo

## 📋 Descrição

Sistema completo e moderno para gerenciar e estudar questões de concursos, com interface elegante, filtros avançados e salvamento automático de progresso.

## ✨ Funcionalidades

### 🔍 Filtros Avançados

### 🔍 Filtros Avançados (Multi-Seleção)

- **Filtros Multi-Seleção**: Permitem selecionar múltiplas opções simultaneamente (ex: Direito Constitucional + Administrativo).
- **Busca Rápida**: Todos os filtros possuem campo de pesquisa instantânea.
- **Disciplina**: Filtre por matérias.
- **Assunto**: Hierárquico (ex: 1. Teoria -> 1.1 Conceito) com suporte a busca.
- **Banca**: Várias bancas ao mesmo tempo.
- **Ano**: Selecione múltiplos anos.
- **Modalidade**: Múltipla Escolha ou Certo/Errado.
- **Status**: Não respondidas, Acertadas, Erradas.

### 📊 Acompanhamento de Progresso

- Total de questões no banco
- Questões respondidas
- Percentual de acertos
- Histórico completo salvo automaticamente

### 💾 Salvamento Automático

- Progresso salvo localmente (localStorage)
- backup automático em JSON
- Sincronização entre dispositivos se estiver no Google Drive
- Comentários pessoais em cada questão

### 🎨 Interface Moderna

- Design premium com gradientes e animações
- Responsivo (funciona em celular, tablet e desktop)
- Modo de visualização de questão em tela cheia
- Navegação por teclado (← → para navegar, ESC para fechar)

## 📁 Estrutura de Arquivos

```
BancoQuestoes/
├── index.html          # Interface principal
├── styles.css          # Estilos modernos
├── app.js              # Lógica da aplicação
├── meu_progresso.json  # Seu progresso (gerado automaticamente)
└── README.md           # Este arquivo
```

## 🚀 Como Usar

### 1. Abrir o Sistema

Simplesmente abra o arquivo `index.html` no seu navegador. Como está no Google Drive, você pode acessar de qualquer lugar!

### 2. Carregar Questões

**Opção A - Automático:**
O sistema tentará carregar automaticamente os JSONs da pasta `../FCC/`.

**Opção B - Manual:**

1. Clique no botão "Carregar JSONs"
2. Selecione um ou mais arquivos JSON com questões
3. As questões serão adicionadas automaticamente

### 3. Filtrar Questões

1. Selecione os filtros desejados
2. Clique em "Aplicar Filtros"
3. Use "Limpar Filtros" para resetar

### 4. Estudar

1. Clique em uma questão para abri-la
2. Leia o enunciado e alternativas
3. Tente responder mentalmente
4. Clique em "Mostrar Resposta" para ver o gabarito
5. Marque se acertou, errou ou não respondeu
6. Adicione comentários pessoais (opcional)
7. Clique em "Salvar Comentários"

### 5. Navegar Entre Questões

- Use os botões "← Anterior" e "Próxima →"
- Ou use as setas do teclado (← →)
- Pressione ESC para fechar a questão

## 📊 Formato dos JSONs de Questões

As questões devem estar no seguinte formato:

```json
[
  {
    "id": "Q3745624",
    "banca": "FCC",
    "year": "2025",
    "orgao": "PGE-TO",
    "prova": "FCC - 2025 - PGE-TO - Procurador",
    "discipline": "Direito Constitucional",
    "subjects": ["Direitos Sociais", "Administração Pública"],
    "enunciation": "Texto da questão...",
    "alternatives": [
      {
        "letter": "A",
        "text": "Texto da alternativa A"
      },
      {
        "letter": "B",
        "text": "Texto da alternativa B"
      }
    ],
    "answer_key": "A",
    "question_url": "https://www.qconcursos.com/..."
  }
]
```

## 📈 Formato do Progresso

Seu progresso é salvo em `meu_progresso.json`:

```json
{
  "lastUpdate": "2025-12-12T16:30:00.000Z",
  "totalQuestions": 1500,
  "progress": {
    "Q3745624": {
      "status": "correct",
      "comments": "Meus comentários sobre esta questão",
      "lastUpdate": "2025-12-12T16:25:00.000Z"
    }
  }
}
```

## 🎨 Personalização

### Cores

Edite as variáveis CSS no início do arquivo `styles.css`:

```css
:root {
    --primary: #6366f1;      /* Cor principal */
    --success: #10b981;      /* Cor de sucesso */
    --danger: #ef4444;       /* Cor de erro */
    /* ... */
}
```

### Questões por Página

Edite no arquivo `app.js`:

```javascript
constructor() {
    this.questionsPerPage = 10;  // Altere para o número desejado
    // ...
}
```

## 🔄 Sincronização entre Dispositivos

Como o sistema está no Google Drive:

1. **Automático**: O `meu_progresso.json` sincroniza automaticamente se você usar o mesmo navegador em diferentes dispositivos
2. **Manual**: Salve o `meu_progresso.json` manualmente e copie entre dispositivos

## ⌨️ Atalhos de Teclado

- `←` : Questão anterior
- `→` : Próxima questão
- `ESC` : Fechar modal

## 🐛 Solução de Problemas

### As questões não carregam

1. Verifique se os arquivos JSON estão na pasta correta
2. Use o botão "Carregar JSONs" para importar manualmente
3. Verifique o console do navegador (F12) para erros

### O progresso não salva

1. Verifique se o navegador permite localStorage
2. Não use modo anônimo/privado
3. Limpe o cache se necessário

### Filtros não funcionam

1. Clique em "Limpar Filtros"
2. Recarregue a página (F5)
3. Verifique se as questões foram carregadas

## 📱 Uso no Celular

O sistema é totalmente responsivo! Para melhor experiência:

1. Adicione à tela inicial do celular
2. Use no modo paisagem para mais espaço
3. Todos os recursos funcionam perfeitamente

## 🔒 Privacidade

- **Todos os dados ficam locais** no seu navegador
- Nenhuma informação é enviada para servidores externos
- Seu progresso é 100% privado

## 💡 Dicas de Uso

1. **Estude por blocos**: Use os filtros para focar em assuntos específicos
2. **Revise os erros**: Use o filtro "Errei" para revisar questões
3. **Adicione comentários**: Anote suas dúvidas e observações
4. **Acompanhe o progresso**: Verifique suas estatísticas regularmente

## 🔄 Atualizando a Taxonomia de Assuntos

O sistema utiliza um arquivo `taxonomy_data.js` para garantir que a hierarquia de assuntos carregue corretamente em qualquer ambiente.

### Se o arquivo `Taxonomia_Limpa.txt` for alterado

1. Modifique o arquivo `Taxonomia_Limpa.txt` conforme desejado.
2. Execute o script `convert_taxonomy.py` (requer Python instalado):

   ```bash
   python convert_taxonomy.py
   ```

3. O script irá gerar automaticamente o novo `taxonomy_data.js`.
4. Recarregue a página com `Ctrl + F5`.

## 📞 Suporte

Se tiver problemas ou sugestões, os logs estarão no console do navegador (F12 → Console).

---

**Feito com ❤️ para concurseiros que querem estudar de forma inteligente!**
