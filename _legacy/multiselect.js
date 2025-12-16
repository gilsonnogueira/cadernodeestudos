class MultiSelect {
    constructor(containerId, placeholder, options = [], onChange = null) {
        this.containerId = containerId;
        this.placeholder = placeholder;
        this.options = options; // Array of { value, label, level, checked }
        this.onChange = onChange;
        this.container = document.getElementById(containerId);

        this.render();
        this.setupEventListeners();
    }

    render() {
        this.container.className = 'multiselect-container';

        // Botão principal
        const selectedCount = this.options.filter(o => o.checked).length;
        const btnText = selectedCount > 0
            ? `${selectedCount} selecionado(s)`
            : this.placeholder;

        this.container.innerHTML = `
            <div class="multiselect-btn" id="${this.containerId}-btn">
                <span>${btnText}</span>
                ${selectedCount > 0 ? `<span class="selected-count">${selectedCount}</span>` : ''}
            </div>
            <div class="multiselect-dropdown" id="${this.containerId}-dropdown">
                <div class="multiselect-search">
                    <input type="text" placeholder="Busca rápida..." id="${this.containerId}-search">
                </div>
                <div class="multiselect-options" id="${this.containerId}-options">
                    <!-- Opções aqui -->
                </div>
            </div>
        `;

        this.renderOptions();
    }

    renderOptions(filterText = '') {
        const optionsContainer = document.getElementById(`${this.containerId}-options`);
        optionsContainer.innerHTML = '';

        const normalizedFilter = filterText.toLowerCase().trim();

        this.options.forEach((option, index) => {
            // Filtro de busca
            if (filterText && !option.label.toLowerCase().includes(normalizedFilter)) {
                return;
            }

            const optionEl = document.createElement('div');
            optionEl.className = `multiselect-option option-level-${option.level || 0} ${option.disabled ? 'disabled' : ''}`;

            if (option.disabled) {
                optionEl.innerHTML = `<span style="font-weight:bold; color:#888;">${option.label}</span>`;
                optionEl.style.cursor = 'default';
                optionEl.style.backgroundColor = '#eee';
            } else {
                optionEl.innerHTML = `
                    <input type="checkbox" id="${this.containerId}-opt-${index}" ${option.checked ? 'checked' : ''}>
                    <label for="${this.containerId}-opt-${index}">
                        ${option.label}
                    </label>
                `;

                // Events only if not disabled
                optionEl.addEventListener('click', (e) => {
                    if (e.target.tagName !== 'INPUT') {
                        const checkbox = optionEl.querySelector('input');
                        checkbox.checked = !checkbox.checked;
                        this.toggleOption(index, checkbox.checked);
                    }
                });

                const checkbox = optionEl.querySelector('input');
                checkbox.addEventListener('change', () => {
                    this.toggleOption(index, checkbox.checked);
                });
            }

            optionsContainer.appendChild(optionEl);
        });

        if (optionsContainer.children.length === 0) {
            optionsContainer.innerHTML = '<div style="padding:10px; color:#666;">Nenhum resultado encontrado</div>';
        }
    }

    toggleOption(index, isChecked) {
        this.options[index].checked = isChecked;

        // Lógica Hierárquica: Marca/Desmarca filhos
        const currentLevel = parseInt(this.options[index].level || 0);

        // Percorre os itens seguintes para encontrar os filhos/descendentes
        for (let i = index + 1; i < this.options.length; i++) {
            const childOption = this.options[i];
            const childLevel = parseInt(childOption.level || 0);

            // Se o nível for menor ou igual, saímos do escopo dos filhos deste item
            if (childLevel <= currentLevel) {
                break;
            }

            // Aplica o mesmo estado do pai (checked/unchecked) apenas se não disabled
            if (!childOption.disabled) {
                childOption.checked = isChecked;
            }
        }

        // Re-renderiza as opções para mostrar as mudanças nos checkboxes dos filhos
        const searchInput = document.getElementById(`${this.containerId}-search`);
        const filterText = searchInput ? searchInput.value : '';
        this.renderOptions(filterText);

        this.updateButton();
        if (this.onChange) this.onChange(this.getSelectedValues());
    }

    updateButton() {
        const btn = document.getElementById(`${this.containerId}-btn`);
        const count = this.options.filter(o => o.checked).length;

        if (count === 0) {
            btn.querySelector('span').textContent = this.placeholder;
            const badge = btn.querySelector('.selected-count');
            if (badge) badge.remove();
        } else {
            btn.querySelector('span').textContent = `${count} selecionado(s)`;
            let badge = btn.querySelector('.selected-count');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'selected-count';
                btn.appendChild(badge);
            }
            badge.textContent = count;
        }
    }

    setupEventListeners() {
        // Toggle dropdown
        const btn = document.getElementById(`${this.containerId}-btn`);
        const dropdown = document.getElementById(`${this.containerId}-dropdown`);
        const searchInput = document.getElementById(`${this.containerId}-search`);

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeAllDropdowns();
            dropdown.classList.toggle('active');
            if (dropdown.classList.contains('active')) {
                searchInput.focus();
            }
        });

        // Search
        searchInput.addEventListener('input', (e) => {
            this.renderOptions(e.target.value);
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });

        // Prevent closing when clicking inside dropdown
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    closeAllDropdowns() {
        document.querySelectorAll('.multiselect-dropdown').forEach(d => {
            if (d.id !== `${this.containerId}-dropdown`) {
                d.classList.remove('active');
            }
        });
    }

    setOptions(newOptions) {
        this.options = newOptions; // Espera { value, label, level, checked }
        this.renderOptions();
        this.updateButton();
    }

    getSelectedValues() {
        return this.options.filter(o => o.checked).map(o => o.value);
    }

    clearSelection() {
        this.options.forEach(o => o.checked = false);
        this.renderOptions();
        this.updateButton();
    }
}
