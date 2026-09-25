"""
VOZX AI - Secure Backend Server & API Endpoint
Serves the VOZX AI Web Application and provides the /api/chat endpoint
connected securely to the OpenAI Chat Completions API.
"""

import os
import sys
import json
import logging
import requests
from flask import Flask, request, jsonify, send_from_directory, send_file

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# Load environment variables from .env
def load_env_file(filepath=".env"):
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    if k not in os.environ or not os.environ[k]:
                        os.environ[k] = v

load_env_file()
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=BASE_DIR, static_url_path="")

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

@app.route("/api/chat", methods=["OPTIONS"])
def chat_options():
    return "", 204

@app.route("/api/health", methods=["GET"])
def api_health():
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    return jsonify({
        "status": "online",
        "service": "VOZX AI Neural Core",
        "has_api_key": bool(api_key),
        "model": os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
    })

@app.route("/api/chat", methods=["POST"])
def api_chat():
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    
    # REQUIREMENT: If the API key is missing, show "AI service unavailable."
    if not api_key:
        logging.warning("Chat requested but OPENAI_API_KEY is not configured.")
        return jsonify({
            "error": "AI service unavailable.",
            "code": "missing_api_key"
        }), 503

    try:
        data = request.get_json(silent=True) or {}
    except Exception:
        return jsonify({
            "error": "Something went wrong. Please try again.",
            "code": "invalid_json"
        }), 400

    user_message = data.get("message", "").strip()
    raw_messages = data.get("messages", [])
    history = data.get("history", [])

    # VOZX AI System Identity Prompt
    system_prompt = {
        "role": "system",
        "content": (
            "You are VOZX AI, an advanced, intelligent, and visionary neural AI assistant ecosystem. "
            "You provide precise, insightful, and helpful answers across coding, research, writing, "
            "planning, and analysis. Be conversational, engaging, futuristic yet grounded. "
            "Format responses cleanly with Markdown (e.g. bold highlights, bullet points, clean code blocks) "
            "when it makes the response easier to read."
        )
    }

    openai_messages = [system_prompt]

    if raw_messages and isinstance(raw_messages, list):
        for m in raw_messages:
            if isinstance(m, dict) and "role" in m and "content" in m:
                openai_messages.append({
                    "role": m["role"],
                    "content": str(m["content"])
                })
    elif history and isinstance(history, list):
        for h in history:
            if isinstance(h, dict) and "role" in h and "content" in h:
                openai_messages.append({
                    "role": h["role"],
                    "content": str(h["content"])
                })
        if user_message:
            openai_messages.append({"role": "user", "content": user_message})
    elif user_message:
        openai_messages.append({"role": "user", "content": user_message})
    else:
        return jsonify({
            "error": "Please provide a message to chat with VOZX AI.",
            "code": "empty_message"
        }), 400

    model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini").strip() or "gpt-4o-mini"

    # Call OpenAI Chat Completions API
    try:
        resp = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": model,
                "messages": openai_messages,
                "temperature": 0.7,
                "max_tokens": 1500
            },
            timeout=35
        )

        try:
            resp_json = resp.json()
        except Exception:
            resp_json = {}

        if resp.status_code == 200:
            choices = resp_json.get("choices", [])
            if choices and len(choices) > 0:
                ai_reply = choices[0].get("message", {}).get("content", "")
                return jsonify({
                    "reply": ai_reply,
                    "role": "assistant",
                    "model": model
                })
            else:
                return jsonify({
                    "error": "Something went wrong. Please try again.",
                    "code": "empty_choices"
                }), 500
        else:
            err_msg = resp_json.get("error", {}).get("message", "OpenAI API request failed")
            err_type = resp_json.get("error", {}).get("type", "")
            logging.error(f"OpenAI error (HTTP {resp.status_code}): {err_msg} [{err_type}]")

            # Fallback to VOZX Autonomous Intelligence Engine so user conversation never breaks
            try:
                from vozx_brain import generate_vozx_reply
                user_name = data.get("userName") or "Varun"
                vozx_reply = generate_vozx_reply(user_message, history=history or raw_messages, user_name=user_name)
                return jsonify({
                    "reply": vozx_reply,
                    "role": "assistant",
                    "model": "vozx-neural-engine",
                    "source": "vozx-autonomous",
                    "fallback": True,
                    "api_error": err_msg
                }), 200
            except Exception as fe:
                logging.error(f"Fallback error: {fe}")
                return jsonify({
                    "error": "Something went wrong. Please try again.",
                    "code": err_type or "api_error",
                    "details": err_msg
                }), resp.status_code

    except requests.exceptions.Timeout:
        logging.error("OpenAI API request timed out (35s), switching to VOZX Neural Engine")
        try:
            from vozx_brain import generate_vozx_reply
            user_name = data.get("userName") or "Varun"
            vozx_reply = generate_vozx_reply(user_message, history=history or raw_messages, user_name=user_name)
            return jsonify({
                "reply": vozx_reply,
                "role": "assistant",
                "model": "vozx-neural-engine",
                "source": "vozx-autonomous",
                "fallback": True
            }), 200
        except Exception:
            return jsonify({
                "error": "Something went wrong. Please try again.",
                "code": "timeout"
            }), 504
    except Exception as e:
        logging.error(f"OpenAI communication error: {e}, switching to VOZX Neural Engine")
        try:
            from vozx_brain import generate_vozx_reply
            user_name = data.get("userName") or "Varun"
            vozx_reply = generate_vozx_reply(user_message, history=history or raw_messages, user_name=user_name)
            return jsonify({
                "reply": vozx_reply,
                "role": "assistant",
                "model": "vozx-neural-engine",
                "source": "vozx-autonomous",
                "fallback": True
            }), 200
        except Exception:
            return jsonify({
                "error": "Something went wrong. Please try again.",
                "code": "server_error"
            }), 500

# Static File Routes
@app.route("/")
def index():
    return send_file(os.path.join(BASE_DIR, "index.html"))

@app.route("/<path:path>")
def static_proxy(path):
    target = os.path.join(BASE_DIR, path)
    if os.path.isfile(target):
        return send_from_directory(BASE_DIR, path)
    return send_file(os.path.join(BASE_DIR, "index.html"))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logging.info(f"VOZX AI Backend running on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)

