
import os

input_file = 'Taxonomia_Limpa.txt'
output_file = 'taxonomy_data.js'

# Tenta ler do diretório atual ou anterior
if not os.path.exists(input_file):
    if os.path.exists('../' + input_file):
        input_file = '../' + input_file
    else:
        print(f"Erro: {input_file} não encontrado.")
        exit(1)

try:
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Escapa crases para não quebrar template string
    content = content.replace('`', '\\`').replace('${', '\\${')
    
    js_content = f"const TAXONOMY_RAW_DATA = `{content}`;"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Sucesso! {output_file} gerado com {len(content)} caracteres.")

except Exception as e:
    print(f"Erro: {e}")
