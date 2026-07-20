import os
import re

def build():
    cwd = os.path.dirname(os.path.abspath(__file__))
    index_path = os.path.join(cwd, 'index.html')
    style_path = os.path.join(cwd, 'style.css')
    app_path = os.path.join(cwd, 'app.js')
    core_path = os.path.join(cwd, 'core', 'estudio_tecnico.js')
    output_path = os.path.join(cwd, 'google_sites_embed.html')
    
    with open(index_path, 'r', encoding='utf-8') as f:
        html = f.read()
    with open(style_path, 'r', encoding='utf-8') as f:
        css = f.read()
    with open(app_path, 'r', encoding='utf-8') as f:
        js = f.read()
    with open(core_path, 'r', encoding='utf-8') as f:
        core = f.read()
    
    # 1. Clean exports in core
    core_clean = re.sub(r'\bexport\s+', '', core)
    
    # 2. Clean imports in app.js (multiline support)
    js_clean = re.sub(r'(?s)import\s+\{.*?\}\s+from\s+[\'"].*?[\'"];?', '', js)
    
    # 3. Combine core and app js
    combined_js = f"{core_clean}\n\n{js_clean}"
    
    # 4. Inline style.css
    html_bundled = re.sub(
        r'<link\s+rel="stylesheet"\s+href="style\.css"\s*/?>',
        f'<style>\n{css}\n</style>',
        html
    )
    
    # 5. Inline combined JS (replace the module script tag with a standard script)
    html_bundled = re.sub(
        r'<script\s+src="app\.js"\s+type="module"\s*></script>',
        f'<script>\n{combined_js}\n</script>',
        html_bundled
    )
    
    # 6. Save final file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_bundled)
        
    print(f"SUCCESS: Google Sites Bundle successfully built at: {output_path}")

if __name__ == '__main__':
    build()
