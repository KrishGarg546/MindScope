from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import ollama
import re
import os
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
from supabase import create_client

from prompt_builder import build_system_prompt


emotion_model = SentenceTransformer(
    "models/sentence_model"
)
def predict_emotion(text):

    emotion_examples = {

        "happy": [
            "I feel amazing today",
            "I am very happy",
            "life is beautiful",
            "I am excited",
            "today was awesome",
            "I feel great"
        ],

        "sad": [
            "I feel empty",
            "I want to cry",
            "I feel depressed",
            "I feel lonely",
            "I am heartbroken",
            "nothing feels good anymore"
        ],

        "anxious": [
            "I am stressed",
            "I feel nervous",
            "I am overthinking",
            "I am worried",
            "I feel anxious",
            "I fear things ending"
        ],

        "angry": [
            "I am furious",
            "I am mad",
            "this annoys me",
            "I hate this",
            "I am frustrated"
        ],

        "calm": [
            "I feel relaxed",
            "I am chilling",
            "everything feels peaceful",
            "I feel okay",
            "I am calm",
            "just relaxing today"
        ]
    }

    text_embedding = emotion_model.encode(
        [text]
    )

    best_emotion = "neutral"

    best_score = -1

    for emotion, examples in emotion_examples.items():

        example_embeddings = emotion_model.encode(
            examples
        )

        similarities = (
            text_embedding @ example_embeddings.T
        )[0]

        avg_score = similarities.mean()

        if avg_score > best_score:

            best_score = avg_score

            best_emotion = emotion
            print("PREDICTED EMOTION:", best_emotion)

    return best_emotion

# =========================================================
# LOAD ENV
# =========================================================

load_dotenv()

# =========================================================
# SUPABASE
# =========================================================

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI()

# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# REQUEST MODEL
# =========================================================

class ChatRequest(BaseModel):

    message: str

    user_name: str = "User"

    ai_name: str = "MindScope"

    personality_profile: dict = {}

    memory: list = []

    history: list = []

    user_id: str

# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/")
async def root():

    return {
        "status": "MindScope backend running"
    }

# =========================================================
# MEMORY EXTRACTION
# =========================================================

def extract_memories(message):

    memories = []

    patterns = [

        r"i have (.+)",
        r"i like (.+)",
        r"i love (.+)",
        r"i hate (.+)",
        r"i am (.+)",
        r"i'm (.+)",
        r"my favorite (.+)",
        r"i usually (.+)",
    ]

    for pattern in patterns:

        matches = re.findall(
            pattern,
            message.lower()
        )

        for match in matches:

            cleaned = match.strip()

            if len(cleaned) > 4:

                memories.append(
                    cleaned[:120]
                )

    return memories

# =========================================================
# CHAT ROUTE
# =========================================================

@app.post("/chat")
async def chat(req: ChatRequest):

    try:

        # =================================================
        # LOAD STORED MEMORIES
        # =================================================

        stored_memories = []

        emotion = predict_emotion(

    req.message
)
        print("FINAL EMOTION:", emotion)

        memory_response = supabase.from_(
            "memories"
        ).select(
            "memory"
        ).eq(
            "user_id",
            req.user_id
        ).execute()

        if memory_response.data:

            stored_memories = [

                item["memory"]

                for item in memory_response.data
            ]

        # =================================================
        # EXTRACT NEW MEMORIES
        # =================================================

        new_memories = extract_memories(
            req.message
        )

        # =================================================
        # SAVE NEW MEMORIES
        # =================================================

        for memory in new_memories:

            already_exists = memory in stored_memories

            if not already_exists:

                supabase.from_(
                    "memories"
                ).insert({

                    "user_id": req.user_id,

                    "memory": memory

                }).execute()

        # =================================================
        # BUILD SYSTEM PROMPT
        # =================================================

        system_prompt = build_system_prompt(
            req.personality_profile
        )

        # =================================================
        # ADD MEMORY CONTEXT
        # =================================================

        if stored_memories:

            memory_text = "\n".join([

                f"- {memory}"

                for memory in stored_memories
            ])

            system_prompt += f"""

Known things about the user:

{memory_text}

Use these naturally in conversation when relevant.
Do not force them into every response.
"""

        # =================================================
        # BUILD MESSAGE ARRAY
        # =================================================

        messages = [

            {
                "role": "system",

                "content": system_prompt
            }
        ]

        # =================================================
        # ADD HISTORY
        # =================================================

        for msg in req.history[-12:]:

            if (
                "role" in msg
                and "content" in msg
            ):

                messages.append({

                    "role": msg["role"],

                    "content": msg["content"]
                })

        # =================================================
        # CURRENT USER MESSAGE
        # =================================================

        messages.append({

            "role": "user",

            "content": req.message
        })

        # =================================================
        # OLLAMA RESPONSE
        # =================================================

        response = ollama.chat(

            model="phi3:mini",

            messages=messages,

            options={

                "temperature": 0.9,

                "top_p": 0.95,
            }
        )

        ai_message = response[
            "message"
        ]["content"]

        # =================================================
        # RETURN RESPONSE
        # =================================================

        return {

            "response": ai_message,

            "new_memories": new_memories
        }

    except Exception as e:

        import traceback

        traceback.print_exc()

    return {
    "response": ai_message,
    "emotion": emotion,
    "new_memories": extracted_memories
}