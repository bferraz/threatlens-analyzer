"""
Script para converter imagem para base64
Use este script para preparar suas imagens antes de enviar para a API
"""

import base64
import sys
from pathlib import Path


def image_to_base64(image_path: str) -> str:
    """
    Converte uma imagem para base64.
    
    Args:
        image_path: Caminho para o arquivo de imagem
        
    Returns:
        String base64 da imagem (sem prefixo data:image/...)
    """
    with open(image_path, "rb") as image_file:
        base64_string = base64.b64encode(image_file.read()).decode('utf-8')
    return base64_string


def main():
    """Função principal."""
    
    print("\n" + "="*60)
    print("🖼️  Conversor de Imagem para Base64")
    print("="*60 + "\n")
    
    # Verificar se foi passado um argumento
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    else:
        # Solicitar caminho da imagem
        image_path = input("Digite o caminho da imagem (PNG, JPG, JPEG): ").strip()
        # Remover aspas se houver
        image_path = image_path.strip('"').strip("'")
    
    # Verificar se o arquivo existe
    if not Path(image_path).exists():
        print(f"\n❌ Erro: Arquivo não encontrado: {image_path}")
        return
    
    # Verificar extensão
    ext = Path(image_path).suffix.lower()
    if ext not in ['.png', '.jpg', '.jpeg']:
        print(f"\n⚠️  Aviso: Extensão '{ext}' pode não ser suportada.")
        print("   Formatos recomendados: .png, .jpg, .jpeg")
    
    try:
        # Converter para base64
        print(f"\n🔄 Convertendo '{Path(image_path).name}'...")
        base64_string = image_to_base64(image_path)
        
        # Informações
        file_size_kb = Path(image_path).stat().st_size / 1024
        base64_size_kb = len(base64_string) / 1024
        
        print(f"✅ Conversão concluída!")
        print(f"\n📊 Informações:")
        print(f"   - Tamanho original: {file_size_kb:.2f} KB")
        print(f"   - Tamanho em base64: {base64_size_kb:.2f} KB")
        print(f"   - Caracteres: {len(base64_string):,}")
        
        if base64_size_kb > 10240:  # 10MB
            print(f"\n⚠️  AVISO: Imagem muito grande ({base64_size_kb/1024:.2f} MB)")
            print(f"   A API tem limite de 10MB. Considere reduzir a imagem.")
        
        # Salvar em arquivo
        output_file = Path(image_path).stem + "_base64.txt"
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(base64_string)
        
        print(f"\n💾 Base64 salvo em: {output_file}")
        
        # Mostrar preview
        preview_length = 100
        if len(base64_string) > preview_length:
            print(f"\n📝 Preview (primeiros {preview_length} caracteres):")
            print(f"   {base64_string[:preview_length]}...")
        else:
            print(f"\n📝 Base64 completo:")
            print(f"   {base64_string}")
        
        # Instruções de uso
        print("\n" + "="*60)
        print("📋 Como usar na API:")
        print("="*60)
        print(f"""
1. Copie o conteúdo do arquivo '{output_file}'
   
2. No Swagger UI (http://localhost:5000/docs):
   - Clique em POST /api/analyze
   - Clique em "Try it out"
   - Preencha o JSON:
   
   {{
     "inputType": "image",
     "imageData": "COLE_O_BASE64_AQUI",
     "imageFileName": "{Path(image_path).name}",
     "analysisDepth": "full",
     "reportFormat": "markdown",
     "includeSeverity": true,
     "includeAssumptions": true
   }}
   
3. Clique em "Execute"

Ou use Python:
""")
        
        print(f"""
import requests

with open("{output_file}", "r") as f:
    base64_data = f.read()

response = requests.post(
    "http://localhost:5000/api/analyze",
    json={{
        "inputType": "image",
        "imageData": base64_data,
        "imageFileName": "{Path(image_path).name}",
        "analysisDepth": "full",
        "reportFormat": "markdown",
        "includeSeverity": True,
        "includeAssumptions": True
    }}
)

result = response.json()
print(f"Ameaças identificadas: {{len(result['threats'])}}")
""")
        
    except Exception as e:
        print(f"\n❌ Erro ao converter imagem: {e}")


if __name__ == "__main__":
    main()
