import streamlit as st
import pickle
import pandas as pd
import numpy as np
import plotly.express as px
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from collections import Counter
from textblob import TextBlob
from datetime import datetime
import textwrap
import os
import re

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
    "better off dead",
    "i am done",
    "i cant do this anymore",
    "i can't do this anymore",
]

CLUSTER_NAMES = {
    0: "Sexual identity / orientation",
    1: "Caregiving / parenting stress",
    2: "General discussion / noise",
    3: "Addiction / substance abuse",
    4: "Behavior change / habit improvement",
    5: "Anxiety / panic",
    6: "Overwhelm / mental load",
    7: "Stress overload",
    8: "Ethical / professional dilemma",
    9: "Trauma / PTSD",
    10: "Anger management",
    11: "Family conflict",
    12: "Low self-esteem / confidence",
    13: "Breakup / heartbreak",
    14: "Relationship intimacy / attachment",
    15: "Grief / loss / negative thoughts",
    16: "Therapy / diagnosis / counseling",
    17: "Mixed distress (unclear cluster)",
    18: "Clinical depression",
    19: "Depression / low motivation",
    -1: "Outlier"
}

CLUSTER_GUIDANCE = {
    5: "Your words carry signs of anxiety, emotional tension, or mental overactivity.",
    6: "This feels emotionally heavy — like too many things are being carried mentally at once.",
    7: "There are signs of prolonged stress and emotional exhaustion.",
    9: "Some of these patterns resemble trauma-related emotional strain.",
    12: "Your words carry self-doubt and emotional self-pressure.",
    13: "This resembles emotional pain connected to attachment, separation, or heartbreak.",
    15: "There are signs of grief, sadness, or emotionally heavy reflection.",
    18: "These emotional patterns resemble depressive heaviness and exhaustion.",
    19: "There are signs of emotional fatigue and low internal energy."
}

SUPPORT_RESPONSES = {
    5: "Anxiety can quietly drain emotional energy over time. Your mind seems to be carrying a lot right now.",

    6: "Emotional overload can make even small things feel difficult. You sound mentally exhausted.",

    7: "Long-term stress can slowly wear down emotional resilience and internal stability.",

    9: "Traumatic emotional experiences can leave the nervous system feeling unsafe long after events pass.",

    12: "Self-criticism can become emotionally exhausting when it turns into your inner voice.",

    13: "Heartbreak can leave behind grief, confusion, emptiness, and emotional exhaustion.",

    15: "Grief often comes in waves. Some moments feel manageable, while others suddenly feel heavy again.",

    18: "Depression can make ordinary life feel emotionally heavy and exhausting.",

    19: "Emotional burnout can slowly reduce motivation, hope, and emotional energy.",

    "default": "What you're carrying sounds difficult. Thank you for putting it into words here."
}

POSITIVE_RESPONSES = {
    "joy": "That sounds like a genuinely meaningful moment of happiness.",

    "gratitude": "That sense of gratitude and appreciation can be deeply grounding.",

    "pride": "You sound proud of what you've achieved — and you deserve to feel that.",

    "hope": "There seems to be hope and forward movement in what you're saying.",

    "relief": "Relief after emotional difficulty can feel incredibly meaningful.",

    "connection": "Feeling emotionally connected and understood can be deeply healing."
}

STOPWORDS = {
    "feel","feeling","felt","like","want","need","know","think",
    "time","good","life","find","help","people","really","make",
    "thing","things","going","something","would","could","much",
    "also","still","even","well","thank","please","self"
}

BAD_CLUSTERS = {-1, 2, 17}

# =====================================================
# LOAD
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

with open("models/positive_centroids.pkl", "rb") as f:
    positive_centroids = pickle.load(f)

positive_labels = list(positive_centroids.keys())

positive_matrix = np.array([
    positive_centroids[l]
    for l in positive_labels
])

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
        "happy",
        "joy",
        "grateful",
        "thankful",
        "won",
        "achievement",
        "achieved",
        "proud",
        "success",
        "excited",
        "peaceful",
        "relieved",
        "hopeful",
        "love",
        "better",
        "finally",
        "improved"
    ]

    negative_words = [
        "tired",
        "alone",
        "empty",
        "hurt",
        "pain",
        "broken",
        "lost",
        "crying",
        "stress",
        "anxious",
        "depressed"
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

def predict_positive_emotion(text):

    vec = model.encode([text])[0]

    sims = cosine_similarity(
        [vec],
        positive_matrix
    )[0]

    idx = np.argmax(sims)

    return positive_labels[idx], sims[idx]

def personalize_support(cluster, user_text):

    base = SUPPORT_RESPONSES.get(
        cluster,
        SUPPORT_RESPONSES["default"]
    )

    text = user_text.lower()
    additions = []

    if "alone" in text or "lonely" in text:
        additions.append(
            "Feeling emotionally alone can make difficult thoughts feel heavier."
        )

    if "tired" in text or "exhausted" in text:
        additions.append(
            "You also sound deeply emotionally worn down."
        )

    if "night" in text:
        additions.append(
            "Nights often make emotional pain feel louder and harder to escape."
        )

    if "empty" in text:
        additions.append(
            "That emotional emptiness can become deeply isolating."
        )

    if "scared" in text or "afraid" in text:
        additions.append(
            "There also seems to be fear underneath what you're carrying."
        )

    return base + " " + " ".join(additions)

def save_feedback(
    text,
    predicted_theme,
    feedback,
    corrected_theme="",
    extra_context=""
):

    row = pd.DataFrame([{
        "text": text,
        "predicted_theme": predicted_theme,
        "feedback": feedback,
        "corrected_theme": corrected_theme,
        "extra_context": extra_context,
        "timestamp": datetime.now()
    }])

    os.makedirs("data", exist_ok=True)

    path = "data/feedback.csv"

    row.to_csv(
        path,
        mode="a",
        header=not os.path.exists(path),
        index=False
    )

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

    if len(subset) == 0:
        continue

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

.stApp {
    background:
    radial-gradient(circle at top left,#0f1c38 0%,#08101f 40%,#040816 100%);
    color: white;
}

.block-container {
    max-width: 1050px;
    padding-top: 2rem;
    padding-bottom: 4rem;
}

.hero {
    margin-bottom: 2rem;
}

.big {
    font-size: 56px;
    font-weight: 700;
    letter-spacing: -1px;
}

.soft {
    opacity: 0.75;
    font-size: 17px;
}

.response-box {
    background: linear-gradient(135deg,#111827,#1c2740);
    border-left: 5px solid #60a5fa;
    border-radius: 24px;
    padding: 28px;
    margin-top: 20px;
}

.support-box {
    background: linear-gradient(135deg,#15243d,#1f3557);
    border-radius: 22px;
    padding: 24px;
    margin-top: 18px;
    border: 1px solid rgba(96,165,250,0.18);
}

.example-box {
    background: rgba(255,255,255,0.035);
    border-radius: 18px;
    padding: 16px;
    margin-bottom: 12px;
    border: 1px solid rgba(255,255,255,0.04);
}

.signal-pill {
    display:inline-block;
    padding:8px 14px;
    border-radius:999px;
    background:rgba(96,165,250,0.15);
    margin-right:8px;
    margin-bottom:8px;
    font-size:14px;
}

textarea {
    border-radius: 20px !important;
}

</style>
""", unsafe_allow_html=True)

# =====================================================
# HERO
# =====================================================

st.markdown(
    """
    <div class='hero'>
        <div class='big'>🧠 MindScope</div>

        <p class='soft'>
        A reflective emotional AI designed to understand emotional patterns in human language.
        </p>
    </div>
    """,
    unsafe_allow_html=True
)

# =====================================================
# INPUT
# =====================================================

st.markdown("## How are you feeling today?")

st.markdown(
    "<p class='soft'>Write freely. MindScope will try to understand the emotional patterns behind your words.</p>",
    unsafe_allow_html=True
)

user_text = st.text_area(
    "",
    placeholder="Write freely...",
    height=170
)

# =====================================================
# HIGH RISK FLOW
# =====================================================

if user_text and detect_high_risk(user_text):

    st.error(
        "🚨 I'm really glad you put that into words."
    )

    st.markdown("""
    <div class='support-box'>

    <p>
    What you're carrying sounds deeply painful right now.
    You deserve support from a real person nearby —
    someone you trust, a loved one, or a mental health professional.
    </p>

    <p>
    Please do not stay alone with these thoughts tonight.
    Even a small step like texting someone or sitting near another person matters.
    </p>

    </div>
    """, unsafe_allow_html=True)

    st.stop()

# =====================================================
# MAIN ANALYSIS
# =====================================================

if user_text:

    with st.spinner("MindScope is reflecting..."):
        pass

    sentiment = detect_sentiment(user_text)

    # =================================================
    # POSITIVE FLOW
    # =================================================

    if sentiment == "positive":

        positive_theme, positive_score = predict_positive_emotion(
            user_text
        )

        response = POSITIVE_RESPONSES.get(
            positive_theme,
            POSITIVE_RESPONSES["joy"]
        )

        st.success(response)

        st.markdown(f"""
        <div class='response-box'>

        <h2>Positive emotional signal detected</h2>

        <p style='font-size:20px;'>
        Your words carry signs of <b>{positive_theme}</b>.
        </p>

        <p class='soft'>
        Confidence: {positive_score:.2%}
        </p>

        </div>
        """, unsafe_allow_html=True)

        save_feedback(
            user_text,
            positive_theme,
            "Positive"
        )

    # =================================================
    # DISTRESS FLOW
    # =================================================

    else:

        vec = model.encode([user_text])[0]

        sims = cosine_similarity(
            [vec],
            centroid_matrix
        )[0]

        best_idx = int(np.argmax(sims))

        cluster = valid_clusters[best_idx]

        score = float(sims[best_idx])

        theme = CLUSTER_NAMES.get(
            cluster,
            f"Cluster {cluster}"
        )

        keywords = cluster_keywords.get(cluster, [])

        strength = "Strong emotional signal"

        if score < 0.65:
            strength = "Moderate emotional signal"

        if score < 0.50:
            strength = "Mixed emotional signal"

        st.markdown(f"""
        <div class='response-box'>

        <h2>MindScope's understanding</h2>

        <p style='font-size:20px;'>
        It sounds like <b>{theme.lower()}</b> may be affecting you right now.
        </p>

        <p class='soft'>
        {CLUSTER_GUIDANCE.get(cluster, '')}
        </p>

        <br>

        <b>{strength}</b>

        </div>
        """, unsafe_allow_html=True)

        # =============================================
        # SIGNALS
        # =============================================

        st.markdown("### Emotional signals noticed")

        pill_html = ""

        for k in keywords[:5]:
            pill_html += f"<span class='signal-pill'>{k}</span>"

        st.markdown(
            pill_html,
            unsafe_allow_html=True
        )

        # =============================================
        # SIMILAR EXPERIENCES
        # =============================================

        st.markdown("### Similar emotional experiences")

        subset = df[df["cluster"] == cluster]

        if len(subset):

            samples = subset["text"].sample(
                min(5, len(subset)),
                random_state=42
            )

            for s in samples:

                wrapped = textwrap.shorten(
                    str(s),
                    width=250,
                    placeholder="..."
                )

                st.markdown(
                    f"<div class='example-box'>{wrapped}</div>",
                    unsafe_allow_html=True
                )

        # =============================================
        # CONFIRMATION
        # =============================================

        st.markdown("### Does this feel accurate?")

        confirmation = st.radio(
            "",
            [
                "✅ Yes, this resonates",
                "🤔 Somewhat",
                "❌ No, not really"
            ],
            horizontal=True
        )

        # =============================================
        # YES FLOW
        # =============================================

        if confirmation == "✅ Yes, this resonates":

            save_feedback(
                user_text,
                theme,
                "Yes"
            )

            support = personalize_support(
                cluster,
                user_text
            )

            st.markdown(f"""
            <div class='support-box'>

            <h3>For you</h3>

            <p>{support}</p>

            </div>
            """, unsafe_allow_html=True)

        # =============================================
        # SOMEWHAT FLOW
        # =============================================

        elif confirmation == "🤔 Somewhat":

            st.info(
                "I may only be partly understanding what you're carrying."
            )

            more_context = st.text_area(
                "Help me understand better:",
                placeholder="Tell me a little more about what feels hardest..."
            )

            if more_context:

                combined_text = user_text + " " + more_context

                vec2 = model.encode([combined_text])[0]

                sims2 = cosine_similarity(
                    [vec2],
                    centroid_matrix
                )[0]

                best_idx2 = int(np.argmax(sims2))

                cluster2 = valid_clusters[best_idx2]

                score2 = float(sims2[best_idx2])

                theme2 = CLUSTER_NAMES.get(
                    cluster2,
                    f"Cluster {cluster2}"
                )

                save_feedback(
                    user_text,
                    theme,
                    "Somewhat",
                    corrected_theme=theme2,
                    extra_context=more_context
                )

                support2 = personalize_support(
                    cluster2,
                    combined_text
                )

                st.markdown(f"""
                <div class='support-box'>

                <h3>Updated understanding</h3>

                <p>
                What you're carrying may be connected to <b>{theme2.lower()}</b>.
                </p>

                <p class='soft'>
                Confidence: {score2:.2%}
                </p>

                <br>

                <p>{support2}</p>

                </div>
                """, unsafe_allow_html=True)

        # =============================================
        # NO FLOW
        # =============================================

        elif confirmation == "❌ No, not really":

            st.info(
                "Thank you for correcting me. That genuinely helps MindScope improve."
            )

            real_feeling = st.text_area(
                "Tell me what you're actually feeling:",
                placeholder="Describe it in your own words..."
            )

            real_label = st.selectbox(
                "Closest theme:",
                list(CLUSTER_NAMES.values())
            )

            if real_feeling:

                save_feedback(
                    user_text,
                    theme,
                    "No",
                    corrected_theme=real_label,
                    extra_context=real_feeling
                )

                st.success(
                    "Thank you. Your correction helps improve future emotional understanding."
                )

# =====================================================
# SYSTEM DETAILS
# =====================================================

with st.expander("Technical system details"):

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
# MAP
# =====================================================

with st.expander("Advanced emotional embedding visualization"):

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