# RAG

A minimal Retrieval-Augmented Generation CLI. It converts documents (PDF, DOCX, PPTX, etc.) into Markdown with **MarkItDown**, chunks and embeds them, stores the vectors in **Qdrant**, and answers questions by routing them to the right collection and grounding the LLM's response in the retrieved context.

## Prerequisites

Install these before setting up the project:

| Requirement | Notes |
| --- | --- |
| [Node.js](https://nodejs.org/) 22+ | Runtime for the app (`build`/`start` scripts). |
| [Yarn](https://yarnpkg.com/) | Package manager (`yarn.lock` is committed). |
| [Python](https://www.python.org/) 3.10+ with `venv` | Needed to install and run MarkItDown. |
| [Docker](https://www.docker.com/) + Docker Compose | Runs the local Qdrant vector database. |
| [Ollama](https://ollama.com/) (or any OpenAI-compatible embeddings endpoint) | Serves the embeddings model locally. |
| An OpenAI-compatible LLM endpoint + API key | For routing and answering questions (e.g. OpenAI, OpenRouter, a local gateway, etc.). |
| `git` | Required to clone the MarkItDown source. |

## Setup

### 1. Install Node dependencies

```bash
yarn install
```

### 2. Set up MarkItDown (Python)

The app shells out to a local `markitdown` CLI (`src/markitdown/compile.ts`) to convert documents to Markdown. Set it up in a project-local virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate

git clone https://github.com/microsoft/markitdown.git
pip install -e './markitdown/packages/markitdown[all]'
```

Make sure the venv is activated (or its `bin/` is on `PATH`) whenever you run the app, so the `markitdown` binary is resolvable.

### 3. Start Qdrant

```bash
docker compose up -d
```

This starts Qdrant on `http://localhost:6333` (as defined in `docker-compose.yaml`).

### 4. Set up the embeddings model (Ollama)

```bash
ollama pull nomic-embed-text
ollama serve   # if not already running
```

Ollama exposes an OpenAI-compatible endpoint at `http://localhost:11434/v1`, used for embeddings. You can swap in any other OpenAI-compatible embeddings provider instead — see the `.env` variables below.

### 5. Configure environment variables

Create a `.env` file in the project root:

```dotenv
# Qdrant
QDRANT_URL=http://localhost:6333

# Where document collections live (subfolders = collection names)
COLLECTIONS_DIR=collections

# Embeddings (OpenAI-compatible)
EMBEDDINGS_BASEURL=http://localhost:11434/v1
EMBEDDINGS_API_KEY=ollama
EMBEDDINGS_MODEL=nomic-embed-text
EMBEDDINGS_DIMENSION=256

# LLM (OpenAI-compatible)
LLM_BASEURL=https://api.openai.com/v1
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4o-mini
```

| Variable | Description |
| --- | --- |
| `QDRANT_URL` | URL of the Qdrant instance. |
| `COLLECTIONS_DIR` | Path (relative to project root) containing one subfolder per collection. |
| `EMBEDDINGS_BASEURL` | Base URL of an OpenAI-compatible embeddings API. |
| `EMBEDDINGS_API_KEY` | API key for the embeddings endpoint (any non-empty value works for local Ollama). |
| `EMBEDDINGS_MODEL` | Embeddings model name. |
| `EMBEDDINGS_DIMENSION` | Output vector size; must match the model and the Qdrant collection config. |
| `LLM_BASEURL` | Base URL of an OpenAI-compatible chat completions API. |
| `LLM_API_KEY` | API key for the LLM endpoint. |
| `LLM_MODEL` | Chat model used for both collection routing and answering. |

### 6. Add your documents

Create a folder per topic under `COLLECTIONS_DIR`, and drop in any files MarkItDown supports (PDF, DOCX, PPTX, XLSX, HTML, images, audio, etc.):

```
collections/
  bitcoin/
    bitcoin.pdf
  programming/
    clean-architecture.pdf
```

Each subfolder becomes a Qdrant collection with the same name. On first run, files are converted, chunked, embedded, and upserted automatically — no separate ingestion step is needed.

### 7. Build

```bash
yarn build
```

## Running the application

```bash
yarn start
```

This will:
1. Create any missing Qdrant collections and ingest their documents.
2. Prompt you for a question (`>>`).
3. Route the question to the most relevant collection via the LLM.
4. Retrieve matching chunks from Qdrant and answer using only that context.

If no collection is relevant to the question, it responds with: `I don't have enough information to answer that.`
