import pandas as pd
import numpy as np
import pickle
import os

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# =====================================================
# CONFIG
# =====================================================

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

# =====================================================
# LOAD ORIGINAL DATA
# =====================================================

original_df = pd.read_csv(
    "models/clustered_data.csv"
)

original_embeddings = np.load(
    "models/embeddings.npy"
)

feedback_df = pd.read_csv(
    "data/feedback.csv"
)

print("Original samples:", len(original_df))
print("Feedback samples:", len(feedback_df))

# =====================================================
# LOAD MODEL
# =====================================================

model = SentenceTransformer(
    "models/sentence_model"
)

# =====================================================
# CLEAN FEEDBACK
# =====================================================

usable_feedback = feedback_df[
    feedback_df["corrected_theme"].notna()
]

usable_feedback = usable_feedback[
    usable_feedback["corrected_theme"] != ""
]

print("Usable feedback:", len(usable_feedback))

# =====================================================
# CREATE NEW TRAINING SAMPLES
# =====================================================

new_rows = []
new_embeddings = []

for _, row in usable_feedback.iterrows():

    text = str(row["text"])

    corrected_theme = str(
        row["corrected_theme"]
    )

    # -----------------------------
    # MAP THEME NAME -> CLUSTER ID
    # -----------------------------

    cluster_id = None

    for k, v in CLUSTER_NAMES.items():
        if v == corrected_theme:
            cluster_id = k
            break

    if cluster_id is None:
        continue

    # -----------------------------
    # EMBEDDING
    # -----------------------------

    embedding = model.encode([text])[0]

    new_rows.append({
        "text": text,
        "processed_text": text.lower(),
        "cluster": cluster_id
    })

    new_embeddings.append(embedding)

print("New learned samples:", len(new_rows))

# =====================================================
# MERGE DATA
# =====================================================

feedback_train_df = pd.DataFrame(new_rows)

merged_df = pd.concat(
    [original_df, feedback_train_df],
    ignore_index=True
)

if len(new_embeddings) > 0:

    new_embeddings = np.array(
        new_embeddings
    )

    merged_embeddings = np.vstack([
        original_embeddings,
        new_embeddings
    ])

else:
    merged_embeddings = original_embeddings

print("Final dataset:", len(merged_df))

# =====================================================
# REBUILD CENTROIDS
# =====================================================

cluster_centroids = {}

clusters = merged_df["cluster"].unique()

for cluster_id in clusters:

    idxs = merged_df[
        merged_df["cluster"] == cluster_id
    ].index.tolist()

    centroid = merged_embeddings[idxs].mean(
        axis=0
    )

    cluster_centroids[cluster_id] = centroid

print("Centroids rebuilt:", len(cluster_centroids))

# =====================================================
# SAVE
# =====================================================

np.save(
    "models/embeddings.npy",
    merged_embeddings
)

merged_df.to_csv(
    "models/clustered_data.csv",
    index=False
)

with open(
    "models/retrained_centroids.pkl",
    "wb"
) as f:

    pickle.dump(
        cluster_centroids,
        f
    )

print("\n✅ MindScope retraining complete.")
print("Updated embeddings saved.")
print("Updated clustered data saved.")
print("Updated centroids saved.")