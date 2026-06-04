import os
import json
from datetime import datetime

CONVO_DIR = "conversations"

os.makedirs(CONVO_DIR, exist_ok=True)


def get_chat_path(chat_id):
    return os.path.join(CONVO_DIR, f"{chat_id}.json")


def create_new_chat():

    chat_id = f"chat_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    data = {
        "id": chat_id,
        "title": "New Chat",
        "created": str(datetime.now()),
        "messages": []
    }

    save_chat(chat_id, data)

    return chat_id


def save_chat(chat_id, data):

    path = get_chat_path(chat_id)

    with open(path, "w") as f:
        json.dump(data, f, indent=2)


def load_chat(chat_id):

    path = get_chat_path(chat_id)

    if not os.path.exists(path):
        return None

    with open(path, "r") as f:
        return json.load(f)


def list_chats():

    chats = []

    for file in os.listdir(CONVO_DIR):

        if file.endswith(".json"):

            with open(os.path.join(CONVO_DIR, file), "r") as f:
                data = json.load(f)
                chats.append(data)

    chats.sort(
        key=lambda x: x["created"],
        reverse=True
    )

    return chats


def delete_chat(chat_id):

    path = get_chat_path(chat_id)

    if os.path.exists(path):
        os.remove(path)