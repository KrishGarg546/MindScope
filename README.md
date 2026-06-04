<div align="center">

# 🧠 MindScope

### *An Emotionally Intelligent Conversational AI Companion*

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.x-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)](https://streamlit.io)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Ollama](https://img.shields.io/badge/Ollama-Local_LLM-222222?style=for-the-badge)](https://ollama.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<br/>

> **MindScope** is a privacy-first, emotionally intelligent AI companion that listens, reflects, and responds with genuine empathy — powered by semantic embeddings, emotional clustering, and local large language models.

<br/>

**⚠️ Disclaimer:** MindScope is *not* a therapist and does not provide medical or psychological treatment. It is a supportive conversational tool designed to promote emotional awareness and self-reflection.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Data Pipeline](#-data-pipeline)
- [Machine Learning Workflow](#-machine-learning-workflow)
- [Ollama Integration](#-ollama-integration)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [Screenshots](#-screenshots)
- [Research Contributions](#-research-contributions)
- [Challenges Faced](#-challenges-faced)
- [Ethical Considerations](#️-ethical-considerations)
- [Future Improvements](#-future-improvements)
- [License](#-license)
- [Author](#-author)

---

## 🌟 Overview

MindScope bridges the gap between conversational AI and emotional intelligence. Using a combination of **semantic embeddings**, **unsupervised clustering**, and **local LLM generation**, MindScope understands the emotional context of user messages and responds with warmth, reflection, and genuine support.

Unlike generic chatbots, MindScope:

- Detects and tracks **emotional themes** over time across conversations
- Generates **personalised reflective responses** grounded in the user's own language
- Runs **entirely locally** using Ollama — no data ever leaves your machine
- Continuously **improves through user feedback** via an integrated retraining pipeline

This project was developed as a **Final Year Computer Science project** and represents a deep exploration of applied NLP, emotional AI, and human-centred design.

---

## ✨ Features

| Category | Feature |
|---|---|
| 🤖 **Conversational AI** | Emotion-aware dialogue with human-like responses |
| 🧬 **Semantic Analysis** | Sentence embedding-based emotion understanding |
| 🔵 **Clustering** | Unsupervised emotional theme discovery |
| 💬 **Reflection** | Personalised emotional reflection generation |
| 📖 **Memory** | Full conversation history management |
| 👍 **Feedback** | In-app user feedback collection |
| 🔁 **Retraining** | Continuous improvement pipeline |
| 📊 **Analytics** | Interactive emotional analytics dashboard |
| 🗺️ **Visualisation** | Embedding-space emotion cluster visualisation |
| 🔒 **Privacy** | Local LLM — no cloud data transmission |
| 🎨 **UI/UX** | Modern, accessible Next.js frontend |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          MindScope System                           │
│                                                                     │
│  ┌──────────────────┐         ┌──────────────────────────────────┐  │
│  │   Next.js        │  HTTP   │         Python Backend           │  │
│  │   Frontend       │◄───────►│         (Streamlit / API)        │  │
│  │   (TypeScript)   │         │                                  │  │
│  └──────────────────┘         │  ┌────────────────────────────┐  │  │
│          │                    │  │   Emotion Engine           │  │  │
│          │                    │  │  ┌──────────────────────┐  │  │  │
│          ▼                    │  │  │  Sentence             │  │  │  │
│  ┌──────────────────┐         │  │  │  Transformer          │  │  │  │
│  │   Supabase       │         │  │  │  Embeddings          │  │  │  │
│  │   (Database &    │         │  │  └──────────────────────┘  │  │  │
│  │    Auth)         │         │  │  ┌──────────────────────┐  │  │  │
│  └──────────────────┘         │  │  │  K-Means / HDBSCAN   │  │  │  │
│                               │  │  │  Clustering          │  │  │  │
│                               │  │  └──────────────────────┘  │  │  │
│                               │  │  ┌──────────────────────┐  │  │  │
│                               │  │  │  Theme Extraction    │  │  │  │
│                               │  │  │  (TF-IDF / KeyBERT)  │  │  │  │
│                               │  │  └──────────────────────┘  │  │  │
│                               │  └────────────────────────────┘  │  │
│                               │                                  │  │
│                               │  ┌────────────────────────────┐  │  │
│                               │  │   Ollama (Local LLM)       │  │  │
│                               │  │   Mistral / Phi-3 Mini     │  │  │
│                               │  └────────────────────────────┘  │  │
│                               └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Role |
|---|---|
| **Next.js Frontend** | User interface, conversation UI, analytics dashboard |
| **Supabase** | Authentication, conversation storage, feedback logs |
| **Python Backend** | Emotion engine, embedding pipeline, response orchestration |
| **Sentence Transformers** | Semantic embedding generation |
| **Clustering Module** | Unsupervised emotional theme discovery |
| **Ollama (LLM)** | Natural language generation, reflection, empathetic replies |

---

## 🔄 Data Pipeline

MindScope's training data was curated from multiple real-world emotional discourse sources to ensure diversity and emotional richness.

### Data Sources

```
📦 Training Corpus
├── 🟠 Reddit   → Emotional discussion threads (r/offmychest, r/mentalhealth, etc.)
├── 🟢 Emotion Datasets  → Labelled emotion classification datasets
├── 🔵 Positive Affect   → Curated positive emotional language datasets
└── 🟣 Mental Health NLP → Anonymised mental health conversation corpora
```

### Pipeline Stages

```
 ┌──────────────┐
 │ 1. Collect   │  Raw text from Reddit, datasets, and mental health forums
 └──────┬───────┘
        ▼
 ┌──────────────┐
 │ 2. Clean     │  Remove noise, duplicates, PII, and off-topic content
 └──────┬───────┘
        ▼
 ┌──────────────┐
 │ 3. Embed     │  Generate dense semantic vectors via Sentence Transformers
 └──────┬───────┘
        ▼
 ┌──────────────┐
 │ 4. Cluster   │  Group semantically similar emotional expressions
 └──────┬───────┘
        ▼
 ┌──────────────┐
 │ 5. Extract   │  Discover keywords and emotional themes per cluster
 └──────┬───────┘
        ▼
 ┌──────────────┐
 │ 6. Themes    │  Label and validate emotional theme taxonomy
 └──────┬───────┘
        ▼
 ┌──────────────┐
 │ 7. Generate  │  Create support response templates for each theme
 └──────┬───────┘
        ▼
 ┌──────────────┐
 │ 8. Feedback  │  Collect real user feedback during deployment
 └──────┬───────┘
        ▼
 ┌──────────────┐
 │ 9. Retrain   │  Incorporate feedback into updated embeddings/clusters
 └──────────────┘
```

---

## 🧬 Machine Learning Workflow

### Embedding & Similarity

MindScope converts every user message into a **high-dimensional semantic vector** using `sentence-transformers`. These embeddings capture not just keyword meaning, but contextual and emotional nuance.

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')
embedding = model.encode("I've been feeling really overwhelmed lately.")
# → 384-dimensional vector encoding emotional context
```

Cosine similarity is then used to match the message against pre-computed emotional cluster centroids:

```python
from sklearn.metrics.pairwise import cosine_similarity

similarity = cosine_similarity([user_embedding], cluster_centroids)
nearest_theme = emotional_themes[similarity.argmax()]
```

### Clustering & Theme Discovery

Emotional themes are discovered **unsupervised** — no manual labelling required:

| Step | Method | Purpose |
|---|---|---|
| Dimensionality Reduction | UMAP / PCA | Reduce 384-dim vectors for clustering |
| Clustering | K-Means / HDBSCAN | Group similar emotional expressions |
| Keyword Extraction | TF-IDF / KeyBERT | Identify dominant themes per cluster |
| Visualisation | Plotly (UMAP 2D) | Plot emotional landscape interactively |

### Outputs per Conversation Turn

```
User Message
    │
    ▼
Semantic Embedding
    │
    ├──► Emotional Theme  (e.g. "loneliness", "anxiety", "hope")
    ├──► Reflection Prompt (contextually aware supportive question)
    ├──► Support Suggestion (coping strategy or reframe)
    └──► Conversation Insight (pattern detected over time)
```

---

## 🤖 Ollama Integration

MindScope uses [Ollama](https://ollama.ai) to run LLMs **entirely on your local machine** — ensuring complete privacy and zero API costs.

### Supported Models

| Model | Size | Best For |
|---|---|---|
| `mistral` | ~4GB | Rich, nuanced conversational responses |
| `phi3:mini` | ~2GB | Faster responses on limited hardware |

### How It Works

```python
import ollama

response = ollama.chat(
    model='mistral',
    messages=[
        {
            'role': 'system',
            'content': (
                "You are MindScope, a warm and emotionally intelligent AI companion. "
                "The user is experiencing: {emotional_theme}. "
                "Respond with empathy, ask thoughtful follow-up questions, "
                "and offer gentle reflection — never give clinical advice."
            )
        },
        {'role': 'user', 'content': user_message}
    ]
)
```

### LLM Responsibilities

- 🗣️ **Natural conversation** — fluid, human-like dialogue
- 🪞 **Emotional reflection** — mirroring and validating feelings
- 💡 **Supportive responses** — gentle reframes and coping insights
- ❓ **Follow-up questions** — deepening emotional exploration
- 🤝 **Empathetic tone** — warm, non-judgmental, compassionate

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 14 + TypeScript | Responsive chat UI and analytics dashboard |
| **Database** | Supabase (PostgreSQL) | Conversation storage, auth, feedback |
| **Backend** | Python + Streamlit | Emotion engine, API, analytics |
| **Embeddings** | Sentence Transformers | Semantic emotion understanding |
| **ML** | Scikit-Learn | Clustering, similarity, dimensionality reduction |
| **LLM** | Ollama (Mistral / Phi-3) | Local language generation |
| **Data** | Pandas + NumPy | Data processing and manipulation |
| **Visualisation** | Plotly | Interactive emotion cluster plots |

---

## 📁 Project Structure

```
mindscope/
│
├── app/                        # Core Python application
│   ├── main.py                 # Streamlit entry point
│   ├── emotion_engine.py       # Embedding & theme matching
│   ├── response_generator.py   # Ollama LLM orchestration
│   ├── conversation_manager.py # History & context management
│   └── feedback_handler.py     # Feedback collection logic
│
├── models/                     # Trained models and artefacts
│   ├── embeddings/             # Precomputed cluster centroids
│   ├── clusters/               # Saved clustering models
│   └── themes/                 # Emotional theme taxonomy (JSON)
│
├── data/                       # Datasets and pipelines
│   ├── raw/                    # Original collected data
│   ├── processed/              # Cleaned and preprocessed data
│   └── pipeline.py             # End-to-end data pipeline script
│
├── notebooks/                  # Research and exploration
│   ├── 01_data_exploration.ipynb
│   ├── 02_embedding_analysis.ipynb
│   ├── 03_clustering_experiments.ipynb
│   └── 04_llm_prompt_testing.ipynb
│
├── conversations/              # Stored conversation logs (local)
│
├── mindscope-frontend/         # Next.js frontend application
│   ├── app/                    # App router pages
│   ├── components/             # Reusable UI components
│   ├── lib/                    # Supabase client, utilities
│   └── public/                 # Static assets
│
├── requirements.txt            # Python dependencies
├── .env.example                # Environment variable template
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

Ensure the following are installed on your system:

- **Python** 3.10+
- **Node.js** 18+ and **npm**
- **Ollama** — [download here](https://ollama.ai/download)
- **Git**

---

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mindscope.git
cd mindscope
```

---

### 2. Backend Setup (Python)

```bash
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows

# Install Python dependencies
pip install -r requirements.txt
```

**Configure environment variables:**

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OLLAMA_MODEL=mistral              # or phi3:mini
OLLAMA_BASE_URL=http://localhost:11434
```

---

### 3. Ollama Setup (Local LLM)

```bash
# Pull your preferred model
ollama pull mistral       # ~4GB, recommended
# or
ollama pull phi3:mini     # ~2GB, faster on limited hardware

# Verify Ollama is running
ollama list
```

---

### 4. Frontend Setup (Next.js)

```bash
cd mindscope-frontend
npm install
```

Configure the frontend environment:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8501
```

---

### 5. Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Navigate to **SQL Editor** and run the schema from `data/supabase_schema.sql`
3. Enable **Row Level Security** as per the included policies
4. Copy your project URL and anon key into your `.env` files

---

## ▶️ Running the Application

### Start the Backend

```bash
# From the project root, with your venv activated
streamlit run app/main.py
```

The backend will be available at `http://localhost:8501`

---

### Start the Frontend

```bash
cd mindscope-frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`

---

### Ensure Ollama is Running

```bash
# In a separate terminal
ollama serve
```

You can verify Ollama is active by visiting `http://localhost:11434`

---

### Run the Data Pipeline (Optional)

To retrain or refresh the emotional cluster models:

```bash
python data/pipeline.py --mode full
# or for feedback-based retraining only:
python data/pipeline.py --mode retrain
```

---

## 📸 Screenshots

> *Screenshots and demo GIFs will be added here.*

| View | Description |
|---|---|
| 🗨️ **Chat Interface** | Main conversation screen with empathetic AI responses |
| 📊 **Analytics Dashboard** | Emotional trend charts over time |
| 🔵 **Embedding Visualisation** | 2D UMAP plot of emotional clusters |
| 📝 **Conversation History** | Past sessions with emotional summaries |
| ⚙️ **Settings Panel** | Model selection, preferences, feedback |

---

## 🔬 Research Contributions

MindScope makes the following original contributions to the field of emotional AI:

1. **Unsupervised Emotional Theme Discovery** — A pipeline combining sentence embeddings and density-based clustering to automatically surface emotional patterns from raw conversational data, without requiring manually labelled training examples.

2. **Emotion-Conditioned Local LLM Prompting** — A novel prompting strategy that injects discovered emotional themes as structured context into LLM system prompts, producing more emotionally resonant and contextually appropriate responses.

3. **Privacy-First Emotional AI Architecture** — A reference architecture demonstrating that a fully functional emotional AI system can be built without sending any user data to external APIs, using entirely local inference.

4. **Feedback-Driven Retraining Loop** — An end-to-end pipeline connecting user feedback signals back into the clustering model, enabling continuous emotional intelligence improvement without human annotation.

---

## 🧗 Challenges Faced

| Challenge | How It Was Addressed |
|---|---|
| **Emotional ambiguity** | Cosine similarity thresholding and multi-theme assignment for ambiguous messages |
| **LLM response consistency** | Structured system prompts with emotional context anchoring |
| **Cold start problem** | Pre-trained cluster centroids from curated corpus; no user data required at launch |
| **Local LLM latency** | Async Streamlit response streaming; lighter `phi3:mini` option for weaker hardware |
| **Ethical data sourcing** | Only public, anonymised datasets used; no scraping of private mental health forums |
| **Embedding dimensionality** | UMAP dimensionality reduction for both clustering efficiency and 2D visualisation |
| **Retraining stability** | Soft cluster updates to prevent catastrophic forgetting of prior emotional patterns |

---

## ⚖️ Ethical Considerations

MindScope was designed with ethics as a core constraint, not an afterthought:

**🔒 Privacy by Design**
All LLM inference runs locally via Ollama. No conversation content is ever transmitted to external servers or third-party APIs.

**🚫 Not a Clinical Tool**
MindScope explicitly and repeatedly communicates that it is a conversational companion, not a therapist or mental health professional. It does not diagnose, prescribe, or provide clinical advice.

**📢 Transparency**
Users are informed they are interacting with an AI system. MindScope does not attempt to pass as human.

**🧹 Responsible Data**
Training data was sourced exclusively from public, anonymised datasets. No private conversations, personal health records, or undisclosed data was used.

**🤝 Supportive, Not Dependent**
The system is designed to encourage emotional self-awareness and self-reflection — not to foster unhealthy reliance on an AI for emotional support.

**⚡ Crisis Redirection**
If crisis indicators are detected in conversation, MindScope is designed to surface appropriate professional resources rather than attempt to handle the situation itself.

---

## 🚀 Future Improvements

- [ ] **Voice interface** — Speech-to-text input and TTS emotional response delivery
- [ ] **Longitudinal emotional tracking** — Multi-week mood trend analysis with visualisation
- [ ] **Multimodal emotion detection** — Facial expression or tone-of-voice analysis
- [ ] **Fine-tuned LLM** — Fine-tune a base model on curated empathetic dialogue datasets
- [ ] **Mobile app** — React Native companion app for iOS and Android
- [ ] **Multi-language support** — Emotion detection and response in additional languages
- [ ] **Therapist handoff protocol** — Structured summaries for optional sharing with professionals
- [ ] **Group conversation mode** — Emotionally aware moderation for small group discussions

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 👤 Author

<div align="center">

**[Your Name]**

*Final Year BSc Computer Science — [Your University]*

[![GitHub](https://img.shields.io/badge/GitHub-@yourusername-181717?style=flat-square&logo=github)](https://github.com/yourusername)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/yourprofile)
[![Email](https://img.shields.io/badge/Email-youremail@example.com-EA4335?style=flat-square&logo=gmail)](mailto:youremail@example.com)

*Built with curiosity, empathy, and a lot of late nights. 🌙*

</div>

---

<div align="center">

*If MindScope resonated with you, consider leaving a ⭐ — it means a lot!*

</div>
