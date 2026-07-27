import os
import re

def build():
    cwd = os.path.dirname(os.path.abspath(__file__))
    index_path = os.path.join(cwd, 'index.html')
    style_path = os.path.join(cwd, 'style.css')
    app_path = os.path.join(cwd, 'app.js')
    core_path = os.path.join(cwd, 'core', 'analisis_economico.js')
    output_path = os.path.join(cwd, 'google_sites_embed.html')
    
    # Read files
    with open(index_path, 'r', encoding='utf-8') as f:
        html = f.read()
    with open(style_path, 'r', encoding='utf-8') as f:
        css = f.read()
    with open(app_path, 'r', encoding='utf-8') as f:
        js_app = f.read()
    with open(core_path, 'r', encoding='utf-8') as f:
        js_core = f.read()
    
    # Clean core JS: remove 'export ' prefix before functions
    js_core_clean = re.sub(r'\bexport\s+function\b', 'function', js_core)
    
    # Clean app JS: remove import block from the beginning of app.js
    # Matches import { ... } from './core/analisis_economico.js';
    import_pattern = r'import\s+\{[\s\S]*?\}\s+from\s+[\'"].*?analisis_economico\.js[\'"];?'
    js_app_clean = re.sub(import_pattern, '', js_app)
    
    # Bundle core + app JS
    combined_js = f"/*=== NUCLEO MATEMATICO ===*/\n{js_core_clean}\n\n/*=== INTERACTIVIDAD Y APLICACION ===*/\n{js_app_clean}"
    
    # Replace CSS stylesheet link with inline style block
    html = re.sub(
        r'<link\s+rel="stylesheet"\s+href="style\.css"\s*/?>',
        f'<style>\n{css}\n</style>',
        html
    )
    
    # Replace JS script tag with inline script block (removing type="module" since it is now bundled)
    html = re.sub(
        r'<script\s+type="module"\s+src="app\.js"\s*></script>',
        f'<script>\n{combined_js}\n</script>',
        html
    )
    
    # Write to output file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)
        
    size_kb = os.path.getsize(output_path) / 1024
    print(f"[OK] Build exitoso: {output_path}")
    print(f"[SIZE] Tamano final: {size_kb:.2f} KB (Objetivo: < 500 KB)")

if __name__ == '__main__':
    build()
