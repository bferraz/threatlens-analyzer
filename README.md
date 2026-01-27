# 🔒 ThreatLens Analyzer

Sistema completo de análise automatizada de ameaças STRIDE para diagramas de arquitetura de software, utilizando IA (GPT-5.2 Vision e GPT-5 Reasoning) para identificar vulnerabilidades e sugerir mitigações.

## 📋 Visão Geral

**ThreatLens Analyzer** combina:
- 🎨 **Frontend**: Interface React moderna e responsiva
- ⚡ **Backend**: API REST FastAPI com integração OpenAI
- 🤖 **IA**: GPT-5.2 (Vision) e GPT-5 para análise de diagramas

## 🚀 Como Executar

### Pré-requisitos

- **Python 3.8+** (backend)
- **Node.js 18+** ou **Bun** (frontend)
- **Chave API OpenAI** com acesso ao GPT-5.2 e GPT-5

### 1️⃣ Backend (API)

```bash
# Navegar para o diretório backend
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
# Copie o arquivo .env.example para .env e adicione sua chave OpenAI
cp .env.example .env
# Edite o .env e adicione: OPENAI_API_KEY=sk-...

# Executar servidor
python main.py
# ou
uvicorn main:app --reload --port 5000
```

O backend estará disponível em: **http://localhost:5000**

Documentação Swagger: **http://localhost:5000/docs**

### 2️⃣ Frontend (Interface Web)

```bash
# Navegar para o diretório frontend
cd front

# Instalar dependências
npm install
# ou com Bun:
bun install

# Executar servidor de desenvolvimento
npm run dev
# ou com Bun:
bun dev
```

O frontend estará disponível em: **http://localhost:5173**

### 3️⃣ Configuração

#### Backend (.env)

Crie um arquivo `.env` na pasta `backend/` com:

```env
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_VISION_MODEL=gpt-5.2
OPENAI_TEXT_MODEL=gpt-5
OPENAI_MAX_TOKENS=16000
API_HOST=0.0.0.0
API_PORT=5000
DEBUG=True
CORS_ORIGINS=["http://localhost:5173"]
```

#### Frontend (api.config.ts)

O arquivo `front/src/config/api.config.ts` já está configurado para o backend local:

```typescript
export const API_CONFIG = {
  BASE_URL: "http://localhost:5000",
  ENDPOINTS: {
    ANALYZE_IMAGE: "/api/analyze/image",
    ANALYZE_MERMAID: "/api/analyze/mermaid",
    DOWNLOAD_REPORT: "/api/report/download",
  },
  TIMEOUT: 600000, // 10 minutos
};
```

## 📖 Funcionalidades

### 1. Análise de Imagens

Upload de diagramas de arquitetura (PNG, JPG, JPEG) para análise automática de ameaças STRIDE.

### 2. Análise de Código Mermaid

Análise de diagramas definidos em código Mermaid.

Exemplo:
```mermaid
graph TD
    User[User] -->|HTTPS| API[API Gateway]
    API -->|gRPC| Service[Backend Service]
    Service -->|SQL| DB[(Database)]
```

### 3. Categorias STRIDE

- **S** - Spoofing (Falsificação de identidade)
- **T** - Tampering (Adulteração de dados)
- **R** - Repudiation (Repúdio de ações)
- **I** - Information Disclosure (Vazamento de informações)
- **D** - Denial of Service (Negação de serviço)
- **E** - Elevation of Privilege (Escalação de privilégios)

### 4. Relatórios

Geração automática de relatórios em **Markdown** ou **PDF** com:
- Componentes identificados
- Fluxos de dados
- Ameaças encontradas (com severidade)
- Mitigações sugeridas (com passos detalhados)
- Suposições e incertezas

## 🏗️ Estrutura do Projeto

```
threatlens-analyzer/
├── backend/              # API FastAPI
│   ├── config/          # Configurações
│   ├── models/          # Modelos Pydantic
│   ├── services/        # Lógica de negócio
│   ├── utils/           # Utilitários
│   ├── reports/         # Relatórios gerados
│   └── main.py          # App principal
│
├── front/               # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes UI
│   │   ├── services/    # Serviços HTTP
│   │   ├── config/      # Configurações
│   │   └── pages/       # Páginas
│   └── public/          # Arquivos estáticos
│
└── docs/                # Documentação
    └── ARCHITECTURE.md  # Arquitetura detalhada
```

## 📚 Documentação

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Arquitetura completa do sistema
- **[Backend README](backend/README.md)** - Documentação específica do backend
- **[Frontend README](front/README.md)** - Documentação específica do frontend
- **[Swagger UI](http://localhost:5000/docs)** - Documentação interativa da API

## 🔌 Endpoints da API

### POST /api/analyze/image
Upload de imagem (multipart/form-data) para análise.

### POST /api/analyze/mermaid
Análise de código Mermaid (JSON).

### GET /api/report/download/{filename}
Download de relatório gerado (.md ou .pdf).

## 🛠️ Tecnologias

### Backend
- **FastAPI** - Framework web moderno
- **OpenAI GPT-5.2** - Análise avançada de imagens com visão
- **OpenAI GPT-5** - Raciocínio inteligente para texto e código
- **Pydantic** - Validação de dados
- **WeasyPrint** - Geração de PDFs
- **Uvicorn** - Servidor ASGI

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **Shadcn/ui** - Componentes UI
- **Mermaid** - Renderização de diagramas

## 🧪 Testes

### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd front
npm run test
# ou
bun test
```

## 🐛 Troubleshooting

### Backend não conecta ao OpenAI
- Verifique se a chave `OPENAI_API_KEY` está correta no `.env`
- Verifique se tem créditos disponíveis na conta OpenAI
- Teste a chave: `curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"`

### Frontend não conecta ao Backend
- Verifique se o backend está rodando em `http://localhost:5000`
- Verifique o console do navegador para erros de CORS
- Confirme que o `CORS_ORIGINS` no backend inclui `http://localhost:5173`

### Relatórios não são gerados
- Verifique se a pasta `backend/reports/` existe e tem permissões de escrita
- Consulte os logs do backend para mensagens de erro

## 📝 Licença

MIT License - veja [LICENSE](backend/LICENSE) para detalhes.

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor:
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📧 Contato

Para dúvidas ou suporte, abra uma issue no GitHub.
