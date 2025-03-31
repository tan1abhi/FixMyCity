import os
import gradio as gr
import google.generativeai as genai
from dotenv import load_dotenv, find_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel()

# Load knowledge base from file
def load_knowledge_base():
    kb_path = os.path.join(os.path.dirname(__file__), 'knowledge_base', 'knowledge.txt')
    with open(kb_path, 'r', encoding='utf-8') as f:
        return f.read()

# Handle user message input
def handle_user_query(msg, chatbot):
    chatbot.append([msg, None])
    return '', chatbot

# Convert chat history to Gemini-compatible format
def generate_chatbot(chatbot: list[list[str, str]]) -> list[dict]:
    formatted_chatbot = []
    for ch in chatbot:
        formatted_chatbot.append({"role": "user", "parts": [ch[0]]})
        formatted_chatbot.append({"role": "model", "parts": [ch[1]]})
    return formatted_chatbot

# Generate response using Gemini model
def handle_gemini_reponse(chatbot):
    query = chatbot[-1][0]
    formatted_chatbot = generate_chatbot(chatbot[:-1])
    chat = model.start_chat(history=formatted_chatbot)

    knowledge = load_knowledge_base()
    prompt = (
        "Use the following context to answer the question accurately:\n\n"
        f"{knowledge}\n\n"
        f"User question: {query}"
    )

    response = chat.send_message(prompt)
    chatbot[-1][1] = response.text
    return chatbot

# Define Gradio interface
with gr.Blocks() as demo:
    chatbot = gr.Chatbot(label='Chat with Gemini', bubble_full_width=False, type='messages')
    msg = gr.Textbox(placeholder="Ask me something...", show_label=False)
    clear = gr.ClearButton([msg, chatbot])

    # Submit user message
    msg.submit(
        handle_user_query,    # function(msg, chatbot)
        [msg, chatbot],       # inputs
        [msg, chatbot]        # outputs
    ).then(
        handle_gemini_reponse, # function(chatbot)
        [chatbot],             # input
        [chatbot]              # output
    )

