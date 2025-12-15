# 🎉 Filtros Avançados Implementados

Substituímos os seletores simples por um sistema poderoso de **múltipla escolha**, igual ao do QConcursos!

## ✨ Novas Funcionalidades

### 1. Multi-Seleção em TUDO 🎯

Agora você pode selecionar:

- **Múltiplas Disciplinas** (ex: Constitucional + Administrativo)
- **Múltiplos Assuntos**
- **Múltiplas Bancas**
- **Vários Anos**

### 2. Busca Rápida 🔍

Dentro de cada filtro há um campo de busca. Digite para filtrar as opções instantaneamente!

### 3. Hierarquia Visual de Assuntos 🌳

Os assuntos agora aparecem organizados:

- **TÓPICO PRINCIPAL** (Negrito)
  - Subtópico (Indentado)
    - Item específico (Mais indentado)

### 4. Lógica Inteligente 🧠

- Ao selecionar uma ou mais disciplinas, a lista de assuntos **atualiza automaticamente** combinando os tópicos de todas elas.
- A filtragem usa lógica "OU" (se selecionar Banca A e Banca B, mostra questões de qualquer uma das duas).

## 📁 Arquivos Modificados

- `multiselect.js`: Novo componente de dropdown avançado.
- `styles.css`: Estilos para o novo dropdown e hierarquia.
- `index.html`: Estrutura atualizada.
- `app.js`: Lógica de filtros totalmente refatorada.

## 🚀 Como Testar

1. **Atualize a página** (Ctrl + F5).
2. Clique no filtro de **Disciplina**.
3. Selecione "Direito Constitucional".
4. Veja que o filtro de **Assunto** atualizou.
5. Abra o filtro de Assunto e veja a hierarquia com checkboxes.
6. Selecione vários itens e clique em "Aplicar Filtros".

Aproveite! 🚀
