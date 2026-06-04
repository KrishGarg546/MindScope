import ollama
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from collections import Counter
from textblob import TextBlob
import textwrap
import re
import random

from chat_manager import *

# =====================================================
# PAGE CONFIG
# =====================================================

st.set_page_config(
    page_title="MindScope",
    page_icon="🧠",
    layout="wide"
)

# =====================================================
# CONFIG
# =====================================================

HIGH_RISK_WORDS = [
    "suicide",
    "kill myself",
    "end my life",
    "dont want to live",
    "don't want to live",
    "wanna die",
    "want to die",
    "end it all",
    "cant go on",
    "can't go on",
]

CLUSTER_NAMES = {
    0: "Identity",
    1: "Caregiving",
    3: "Habits",
    4: "Self Improvement",
    5: "Anxiety",
    6: "Overthinking",
    7: "Stress",
    8: "Life",
    9: "Trauma",
    10: "Anger",
    11: "Family",
    12: "Confidence",
    13: "Heartbreak",
    14: "Relationships",
    15: "Grief",
    16: "Therapy",
    18: "Depression",
    19: "Burnout",
}

STOPWORDS = {
    "feel","feeling","felt","like","want","need","know","think",
    "time","good","life","find","help","people","really","make",
    "thing","things","going","something","would","could","much",
    "also","still","even","well","thank","please","self"
}

BAD_CLUSTERS = {-1, 2, 17}

# =====================================================
# LOAD MODELS
# =====================================================

@st.cache_resource
def load_model():
    return SentenceTransformer("models/sentence_model")

@st.cache_data
def load_data():
    df = pd.read_csv("models/clustered_data.csv")
    emb = np.load("models/embeddings.npy")
    emb2d = np.load("models/embedding_2d.npy")
    return df, emb, emb2d

model = load_model()
df, embeddings, emb2d = load_data()

df["cluster"] = df["cluster"].astype(int)

# =====================================================
# CHAT SESSION STATE
# =====================================================

if "current_chat" not in st.session_state:

    chats = list_chats()

    if chats:
        st.session_state.current_chat = chats[0]["id"]
    else:
        st.session_state.current_chat = create_new_chat()

# =====================================================
# HELPERS
# =====================================================

def detect_high_risk(text):
    text = text.lower()
    return any(word in text for word in HIGH_RISK_WORDS)


def detect_sentiment(text):

    polarity = TextBlob(text).sentiment.polarity
    text_lower = text.lower()

    positive_words = [
        "happy", "joy", "grateful", "thankful", "won",
        "achievement", "achieved", "proud", "success",
        "excited", "peaceful", "relieved", "hopeful",
        "love", "better", "finally"
    ]

    negative_words = [
        "tired", "alone", "empty", "hurt", "pain",
        "broken", "lost", "crying", "stress",
        "anxious", "depressed"
    ]

    positive_hits = sum(word in text_lower for word in positive_words)
    negative_hits = sum(word in text_lower for word in negative_words)

    if positive_hits >= 1 and negative_hits == 0:
        return "positive"

    if polarity > 0.3:
        return "positive"

    elif polarity < -0.15:
        return "negative"

    else:
        return "neutral"

# =====================================================
# STREAMING AI RESPONSE
# =====================================================

def generate_ai_response(user_input, theme, messages):

    recent_messages = messages[-6:]

    conversation_context = ""

    for msg in recent_messages:
        role = msg["role"]
        content = msg["content"]
        conversation_context += f"{role}: {content}\n"

    prompt_text = f"""
You are MindScope.

You are a warm, emotionally intelligent AI companion.

IMPORTANT RULES:

- Talk naturally like a real person.
- Keep conversations casual unless the user becomes deeply emotional.
- Match the user's energy.
- Keep responses short.
- Most replies should be 1-3 sentences.
- Avoid therapist language.
- Do not psychoanalyze the user.
- Avoid robotic emotional wording.
- Be curious and conversational.
- Humor is allowed.

Never say things like:
- "I hear you"
- "That sounds really difficult"
- "You seem emotionally"
- "There seems to be"
- "MindScope notices"

Conversation so far:
{conversation_context}

Detected theme:
{theme}

User:
{user_input}

Write the next assistant response.
"""

    stream = ollama.chat(
        model='phi3:mini',
        messages=[
            {
                'role': 'user',
                'content': prompt_text
            }
        ],
        stream=True,
        options={
            "temperature": 0.72,
            "num_predict": 70,
            "top_p": 0.9,
            "repeat_penalty": 1.15
        }
    )

    return stream

# =====================================================
# BUILD CLUSTER INTELLIGENCE
# =====================================================

valid_clusters = sorted([
    int(c)
    for c in df["cluster"].unique()
    if int(c) not in BAD_CLUSTERS
])

cluster_centroids = {}
cluster_keywords = {}

for c in valid_clusters:

    subset = df[df["cluster"] == c]

    idxs = subset.index.tolist()

    cluster_centroids[c] = embeddings[idxs].mean(axis=0)

    text = " ".join(
        subset["processed_text"].astype(str)
    ).lower()

    words = re.findall(r"\b[a-z]{4,}\b", text)

    filtered = [
        w for w in words
        if w not in STOPWORDS
    ]

    cluster_keywords[c] = [
        w for w, _ in Counter(filtered).most_common(8)
    ]

centroid_matrix = np.array([
    cluster_centroids[c]
    for c in valid_clusters
])

# =====================================================
# UI STYLE
# =====================================================

st.markdown("""
<style>

@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap');

html, body, [class*="css"] {
    font-family: 'Geist', sans-serif;
}

/* ── App background ── */
.stApp {
    background: #0a0a0b;
    color: #e8e8e8;
}

/* ── Main content container ── */
.block-container {
    max-width: 860px !important;
    padding: 0 !important;
    margin: 0 auto !important;
}

/* ── Sidebar ── */
.stSidebar {
    background: #111114 !important;
    border-right: 1px solid #1e1e22 !important;
}

.stSidebar .stMarkdown h1 {
    font-size: 18px !important;
    font-weight: 600 !important;
    color: #f0f0f0 !important;
    letter-spacing: -0.02em;
    padding: 1rem 0 0.5rem;
}

/* Sidebar buttons */
.stSidebar .stButton > button {
    background: transparent !important;
    color: #a0a0a8 !important;
    border: 1px solid transparent !important;
    border-radius: 8px !important;
    font-size: 13px !important;
    font-family: 'Geist', sans-serif !important;
    text-align: left !important;
    padding: 8px 12px !important;
    transition: all 0.15s ease !important;
    font-weight: 400 !important;
}

.stSidebar .stButton > button:hover {
    background: #1a1a1e !important;
    color: #e8e8e8 !important;
    border-color: #2a2a30 !important;
}

/* New Chat button — top one */
.stSidebar .stButton:first-of-type > button {
    background: #1a1a1e !important;
    color: #e8e8e8 !important;
    border: 1px solid #2a2a30 !important;
    font-weight: 500 !important;
    font-size: 13px !important;
    margin-bottom: 4px !important;
}

.stSidebar .stButton:first-of-type > button:hover {
    background: #222228 !important;
    border-color: #3a3a44 !important;
}

/* Sidebar divider */
.stSidebar hr {
    border-color: #1e1e22 !important;
    margin: 8px 0 !important;
}

/* ── Hero title area ── */
.title {
    font-size: 22px;
    font-weight: 600;
    color: #f0f0f0;
    letter-spacing: -0.03em;
    margin-bottom: 0;
    line-height: 1.2;
}

.subtitle {
    font-size: 13px;
    color: #52525b;
    margin-top: 4px;
    margin-bottom: 20px;
    font-weight: 400;
    letter-spacing: 0.01em;
}

/* ── Chat messages ── */
.stChatMessage {
    background: transparent !important;
    border: none !important;
    padding: 4px 0 !important;
    border-radius: 0 !important;
}

/* User message bubbles */
[data-testid="stChatMessage"][data-author="user"] {
    flex-direction: row-reverse !important;
}

[data-testid="stChatMessage"][data-author="user"] .stChatMessageContent {
    background: #1c1c22 !important;
    border: 1px solid #2a2a32 !important;
    border-radius: 18px 18px 4px 18px !important;
    color: #e8e8e8 !important;
    padding: 10px 16px !important;
    max-width: 75% !important;
    font-size: 14px !important;
    line-height: 1.6 !important;
}

/* Assistant message bubbles */
[data-testid="stChatMessage"][data-author="assistant"] .stChatMessageContent {
    background: transparent !important;
    border: none !important;
    color: #d4d4d8 !important;
    padding: 8px 4px !important;
    font-size: 14px !important;
    line-height: 1.7 !important;
    max-width: 88% !important;
}

/* Avatar circles */
[data-testid="stChatMessage"] .stAvatar {
    width: 28px !important;
    height: 28px !important;
    border-radius: 50% !important;
    font-size: 11px !important;
    margin-top: 4px !important;
}

/* ── Chat input ── */
.stChatInput {
    border-top: 1px solid #1a1a1e !important;
    background: #0a0a0b !important;
    padding: 12px 0 16px !important;
}

.stChatInput textarea {
    background: #111114 !important;
    border: 1px solid #252528 !important;
    border-radius: 14px !important;
    color: #e8e8e8 !important;
    font-family: 'Geist', sans-serif !important;
    font-size: 14px !important;
    padding: 12px 16px !important;
    caret-color: #7c7cff !important;
    transition: border-color 0.2s ease !important;
    resize: none !important;
}

.stChatInput textarea:focus {
    border-color: #3a3a50 !important;
    box-shadow: 0 0 0 3px rgba(124,124,255,0.06) !important;
    outline: none !important;
}

.stChatInput textarea::placeholder {
    color: #3a3a42 !important;
}

/* Send button */
.stChatInput button {
    background: #1c1c28 !important;
    border: 1px solid #2e2e40 !important;
    border-radius: 10px !important;
    color: #7c7cff !important;
    transition: all 0.15s ease !important;
}

.stChatInput button:hover {
    background: #23233a !important;
    border-color: #4040a0 !important;
}

/* ── Spinner ── */
.stSpinner {
    color: #52525b !important;
}

/* ── Expanders ── */
.streamlit-expanderHeader {
    background: #111114 !important;
    border: 1px solid #1e1e22 !important;
    border-radius: 10px !important;
    color: #71717a !important;
    font-size: 13px !important;
    font-family: 'Geist', sans-serif !important;
    font-weight: 500 !important;
    padding: 10px 14px !important;
    transition: all 0.15s ease !important;
}

.streamlit-expanderHeader:hover {
    background: #16161a !important;
    color: #a1a1aa !important;
    border-color: #2a2a30 !important;
}

.streamlit-expanderContent {
    background: #0d0d10 !important;
    border: 1px solid #1e1e22 !important;
    border-top: none !important;
    border-radius: 0 0 10px 10px !important;
    padding: 16px !important;
}

/* ── Metrics ── */
[data-testid="stMetric"] {
    background: #111114 !important;
    border: 1px solid #1e1e22 !important;
    border-radius: 10px !important;
    padding: 14px 16px !important;
}

[data-testid="stMetricLabel"] {
    color: #52525b !important;
    font-size: 11px !important;
    font-weight: 500 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.06em !important;
    font-family: 'Geist Mono', monospace !important;
}

[data-testid="stMetricValue"] {
    color: #e4e4e7 !important;
    font-size: 22px !important;
    font-weight: 600 !important;
    letter-spacing: -0.02em !important;
}

/* ── Selectbox ── */
.stSelectbox > div > div {
    background: #111114 !important;
    border: 1px solid #252528 !important;
    border-radius: 8px !important;
    color: #d4d4d8 !important;
    font-size: 13px !important;
}

/* ── Headings inside expanders ── */
.streamlit-expanderContent h3 {
    color: #71717a !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.08em !important;
    margin: 16px 0 8px !important;
    font-family: 'Geist Mono', monospace !important;
}

/* ── Example text boxes ── */
.example-box {
    background: #111114;
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 8px;
    border: 1px solid #1e1e22;
    font-size: 13px;
    color: #71717a;
    line-height: 1.6;
    font-family: 'Geist', sans-serif;
    transition: border-color 0.15s ease;
}

.example-box:hover {
    border-color: #2a2a35;
    color: #a1a1aa;
}

/* ── Scrollbar ── */
::-webkit-scrollbar {
    width: 4px;
}
::-webkit-scrollbar-track {
    background: transparent;
}
::-webkit-scrollbar-thumb {
    background: #252528;
    border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
    background: #3a3a3e;
}

/* ── Divider lines ── */
hr {
    border-color: #1e1e22 !important;
}

/* ── Plotly chart wrapper ── */
.js-plotly-plot .plotly {
    border-radius: 10px;
    overflow: hidden;
}

/* ── Keyword pills ── */
.stMarkdown p {
    font-size: 14px;
    color: #71717a;
    line-height: 1.7;
}

</style>
""", unsafe_allow_html=True)

# =====================================================
# SIDEBAR
# =====================================================

with st.sidebar:

    st.markdown("""
    <div style="padding: 16px 0 12px 0;">
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">🧠</span>
            <span style="font-size: 15px; font-weight: 600; color: #e4e4e7; letter-spacing: -0.02em;">MindScope</span>
        </div>
        <div style="font-size: 11px; color: #3f3f46; margin-top: 4px; font-family: 'Geist Mono', monospace; letter-spacing: 0.04em;">CONVERSATIONS</div>
    </div>
    """, unsafe_allow_html=True)

    if st.button("＋  New chat", use_container_width=True):

        new_chat = create_new_chat()
        st.session_state.current_chat = new_chat
        st.rerun()

    st.markdown("---")

    chats = list_chats()

    for chat in chats:

        title = chat.get("title", "New Chat")

        if st.button(title, use_container_width=True):
            st.session_state.current_chat = chat["id"]
            st.rerun()

# =====================================================
# LOAD CHAT
# =====================================================

chat_data = load_chat(
    st.session_state.current_chat
)

if chat_data is None:

    st.session_state.current_chat = create_new_chat()

    chat_data = load_chat(
        st.session_state.current_chat
    )

messages = chat_data["messages"]

# =====================================================
# HERO
# =====================================================

st.markdown(
    """
    <div style="padding: 24px 0 8px 0; border-bottom: 1px solid #1a1a1e; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
            <div style="
                width: 30px; height: 30px;
                background: #151520;
                border: 1px solid #2a2a40;
                border-radius: 8px;
                display: flex; align-items: center; justify-content: center;
                font-size: 15px;
            ">🧠</div>
            <div class='title'>MindScope</div>
        </div>
        <div class='subtitle'>emotionally intelligent · always listening</div>
    </div>
    """,
    unsafe_allow_html=True
)

# =====================================================
# DISPLAY MESSAGES
# =====================================================

for msg in messages:

    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# =====================================================
# CHAT INPUT
# =====================================================

prompt = st.chat_input("Talk to MindScope...")

# =====================================================
# MAIN FLOW
# =====================================================

if prompt:

    messages.append({
        "role": "user",
        "content": prompt
    })

    chat_data["messages"] = messages

    save_chat(
        st.session_state.current_chat,
        chat_data
    )

    # Auto title
    if len(messages) <= 2:

        short_title = prompt[:30]

        chat_data["title"] = short_title

        save_chat(
            st.session_state.current_chat,
            chat_data
        )

    with st.chat_message("user"):
        st.markdown(prompt)

    # =====================================================
    # SHORT INPUTS
    # =====================================================

    if len(prompt.split()) < 2:

        casual_responses = [
            "hey 😭 what's up",
            "yo what's going on",
            "hii how was your day",
            "tell me more 👀",
            "what happened"
        ]

        final_response = random.choice(casual_responses)

        with st.chat_message("assistant"):
            st.markdown(final_response)

    # =====================================================
    # HIGH RISK
    # =====================================================

    elif detect_high_risk(prompt):

        final_response = """
What you're saying sounds really serious.

Please reach out to someone you trust or a mental health professional nearby.
You do not have to deal with this alone.
"""

        with st.chat_message("assistant"):
            st.markdown(final_response)

    # =====================================================
    # NORMAL FLOW
    # =====================================================

    else:

        with st.spinner("MindScope is typing..."):

            sentiment = detect_sentiment(prompt)

            vec = model.encode([prompt])[0]

            sims = cosine_similarity(
                [vec],
                centroid_matrix
            )[0]

            best_idx = int(np.argmax(sims))

            cluster = valid_clusters[best_idx]

            theme = CLUSTER_NAMES.get(
                cluster,
                f"Cluster {cluster}"
            )

            stream = generate_ai_response(
                prompt,
                theme,
                messages
            )

        final_response = ""

        with st.chat_message("assistant"):

            message_placeholder = st.empty()

            for chunk in stream:

                if "message" in chunk:

                    content = chunk["message"]["content"]

                    final_response += content

                    message_placeholder.markdown(final_response + "▌")

            message_placeholder.markdown(final_response)

    # =====================================================
    # SAVE ASSISTANT MESSAGE
    # =====================================================

    messages.append({
        "role": "assistant",
        "content": final_response
    })

    chat_data["messages"] = messages

    save_chat(
        st.session_state.current_chat,
        chat_data
    )

# =====================================================
# TECH DETAILS
# =====================================================

with st.expander("System details"):

    c1, c2, c3, c4 = st.columns(4)

    c1.metric(
        "Texts analyzed",
        f"{len(df):,}"
    )

    c2.metric(
        "Active clusters",
        len(valid_clusters)
    )

    c3.metric(
        "Outliers",
        int((df["cluster"] == -1).sum())
    )

    c4.metric(
        "Embedding model",
        "MiniLM"
    )

# =====================================================
# EXPLORER
# =====================================================

with st.expander("Explore emotional themes"):

    selected_name = st.selectbox(
        "Choose emotional theme",
        [CLUSTER_NAMES[c] for c in valid_clusters]
    )

    selected_cluster = next(
        k for k, v in CLUSTER_NAMES.items()
        if v == selected_name
    )

    subset = df[df["cluster"] == selected_cluster]

    st.markdown("### Top Keywords")

    st.write(
        " • ".join(
            cluster_keywords.get(selected_cluster, [])
        )
    )

    st.markdown("### Example texts")

    if len(subset):

        samples = subset["text"].sample(
            min(5, len(subset)),
            random_state=42
        )

        for s in samples:

            wrapped = textwrap.fill(
                str(s),
                width=120
            )

            st.markdown(
                f"<div class='example-box'>{wrapped}</div>",
                unsafe_allow_html=True
            )

# =====================================================
# EMBEDDING MAP
# =====================================================

with st.expander("Embedding map"):

    plot_df = df.copy()

    plot_df["label"] = plot_df[
        "cluster"
    ].map(CLUSTER_NAMES).fillna("Unknown")

    fig = px.scatter(
        plot_df,
        x="x",
        y="y",
        color="label",
        hover_data=["text"],
        height=700
    )

    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)"
    )

    st.plotly_chart(
        fig,
        use_container_width=True
    )