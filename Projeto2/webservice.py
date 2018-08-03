from flask import Flask, request, render_template, flash
from flask_cors import CORS, cross_origin
from itertools import product
import sched, time
import json
import os
import random
import threading
import subprocess
# Criar objeto FLASK
app = Flask(__name__)
app.secret_key = os.urandom(12)

cors = CORS(app, resources={r"/": {"origins": "http://localhost:4444"}})

usersList = []
users = dict()
team = ["Sporting", "Braga", "Benfica", "Porto", "Boavista", "Belenenses", "Academica",
        "Aves", "Maritimo", "Chaves", "Moreirense", "Tondela"]
teams = dict()
statics = dict()
token = dict()
bets = []
stats = ["empate", "vitoria", "derrota"]

teams = zipped = zip(team[0::2], team[1::2])
teams = dict(enumerate(teams))

games = []
for key, value in teams.items():
    s = dict()
    for x in stats:
        n = round(random.uniform(1, 3), 2)
        s.update({ x : n })

    games.append({ "team": key, "vs": value,"stats": s })


with open('statics.json') as json_file:
    statics = json.load(json_file)

with open('data.json') as json_file:
    users = json.load(json_file)


@app.route("/result", methods=['POST', 'GET'])
@cross_origin(origin='localhost',headers=['Content- Type','Authorization'])
def display():
    global teams, team

    return render_template('home_page.html', result=teams)


@app.route("/")
@cross_origin(origin='localhost',headers=['Content- Type','Authorization'])
def index():
    global users

    key2 = request.headers.get('X-AUTH-TOKEN')

    if [k for k, v in users.items() if key2 in v]:
        return render_template('login.html')
    else:
        return render_template('home_page.html')


@app.route("/list")
@cross_origin(origin='localhost',headers=['Content- Type','Authorization'])
def listUsers():
    global users
    key2 = request.headers.get('X-AUTH-TOKEN')

    if [k for k, v in users.items() if key2 in v]:
        return json.dumps(users)


@app.route("/register", methods=['POST'])
@cross_origin(origin='localhost',headers=['Content- Type','Authorization'])
def registerUser():
    global users, usersList, statics

    username = request.form.get('username', '').strip()
    password = request.form.get('password', '').strip()
    email = request.form.get('email', '').strip()

    if username in users:
        msg = send_message("registration", 2, "UserInUser")
        return json.dumps(msg)
    else:
        users[username] = [password, email]
        statics[str(username)] = ["Não Existe", "Não Existe", "Não Existe", "Não Existe", "Não Existe", 100, 0]
        msg = send_message("registration", 1, "registOK")

        with open('data.json', 'w') as outfile:
            json.dump(users, outfile)

        with open('statics.json', 'w') as outfile:
            json.dump(statics, outfile)

        return json.dumps(msg)


@app.route("/login", methods=['POST'])
@cross_origin(origin='localhost',headers=['Content- Type','Authorization'])
def login():
    global users, usersList, tries, statics

    username = request.form.get('username', '').strip()
    password = request.form.get('password', '').strip()
    token = random.randint(0, 9999999999999999999)
    token = str(token)

    if username in users and password == users[username][0]:
        users[username].append(token)
        msg = dict()
        msg["type"] = "login"
        msg["result"] = 1
        msg["text"] = "LoginOk"
        msg["token"] = str(token)
        return json.dumps(msg)
    else:
        msg = send_message("login", 2, "LoginkO")
        return json.dumps(msg)


@app.route("/logout", methods=['GET'])
@cross_origin(origin='localhost',headers=['Content- Type','Authorization'])
def logout():
    global users, usersList, tries, statics

    key2 = request.headers.get('X-AUTH-TOKEN')

    if key2 != "":
        msg = send_message("login", 1, "LoginOk")
        return json.dumps(msg)
    else:
        msg = send_message("login", 2, "LoginkO")
        return json.dumps(msg)


@app.route("/data", methods=['GET'])
@cross_origin(origin='localhost',headers=['Content- Type','Authorization'])
def data():
    global teams, users

    key2 = request.headers.get('X-AUTH-TOKEN')

    if [k for k, v in users.items() if key2 in v]:
        return json.dumps(games)
    else:
        return json.dumps("Not allowed")


@app.route("/historico", methods=['GET'])
@cross_origin(origin='localhost', headers=['Content- Type', 'Authorization'])
def historico():
    global teams, users

    key2 = request.headers.get('X-AUTH-TOKEN')

    user = [k for k, v in users.items() if key2 in v]
    user = str(user)
    user = user[2:]
    user = user[:-2]

    if user == "admin":
        return json.dumps(statics)
    if [k for k, v in users.items() if key2 in v]:
        return json.dumps(statics[user])
    else:
        return json.dumps("Not allowed")


@app.route("/user", methods=['GET'])
@cross_origin(origin='localhost',headers=['Content- Type','Authorization'])
def user():
    global statics, users

    key2 = request.headers.get('X-AUTH-TOKEN')

    user = [k for k, v in users.items() if key2 in v]
    user = str(user)
    user = user[2:]
    user = user[:-2]
    dataUser = []
    user = str(user)
    contas = []
    saldo = 0
    for key, value in statics.items():
        if key != "admin":
            print(key, value[-1])
            contas.append(value[-1])
            saldo += float(value[-1])

    if [k for k, v in users.items() if key2 in v]:
        if user == "admin":
            test = list(statics[user])
            userMoney = test[-2]
            userWinning = -saldo
            dataUser.append(user)
            dataUser.append(userMoney)
            dataUser.append(userWinning)
        else:
            test = list(statics[user])
            userMoney = test[-2]
            userWinning = test[-1]
            dataUser.append(user)
            dataUser.append(userMoney)
            dataUser.append(userWinning)
        return json.dumps(dataUser)
    else:
         return json.dumps("Not allowed")


@app.route("/bets", methods=['POST'])
@cross_origin(origin='localhost',headers=['Content- Type','Authorization'])
def bet():
    global statics, teams, users, bets

    key2 = request.headers.get('X-AUTH-TOKEN')
    user = [k for k, v in users.items() if key2 in v]
    user = str(user)
    user = user[2:]
    user = user[:-2]
    teamBet = request.form.get('fname', '').strip()
    oddBet = request.form.get('odd', '').strip()
    moneyBet = request.form.get('valor', '').strip()
    winBet = request.form.get('ganhos', '').strip()
    test = list(statics[user])
    userMoney = test[-2]
    userWinning = test[-1]
    winOrLost = ['Win', 'Lost']
    resultMatch = random.choice(winOrLost)

    try:
        if float(moneyBet) >= float(userMoney):
            msg = send_message("bet", 1, "semsaldo")
            return json.dumps(msg)
    except:
            msg = send_message("bet", 1, "semsaldo")
            return json.dumps(msg)

    print(resultMatch)

    if [k for k, v in users.items() if key2 in v]:
        usermoneybet = float(userMoney) - float(moneyBet)
        statics[user][-2] = usermoneybet
        if resultMatch == "Win" and len(teamBet) > 0:
            msg = send_message("bet", 1, "betregist")
            userMoney = float(userMoney)
            userWinning += float(winBet)
            userMoney += float(winBet)
            bets.append(user)
            bets.append(teamBet)
            bets.append("Win")
            bets.append(oddBet)
            bets.append(moneyBet)
            bets.append(winBet)
        elif resultMatch == "Lost" and len(teamBet) > 0:
            msg = send_message("bet", 1, "betregist")
            userMoney = float(userMoney)
            userMoney = userMoney - float(moneyBet)
            bets.append(user)
            bets.append(teamBet)
            bets.append("Lost")
            bets.append(oddBet)
            bets.append(moneyBet)
            bets.append(winBet)
        else:
            print("aqui1")
            msg = send_message("bet", 1, "betNotregist")

        return json.dumps(msg)

    else:
        print("aqui2")
        msg = send_message("bet", 1, "betNotregist")
        return json.dumps(msg)


# Start FLASK web server
def appRun():
    app.run(host='127.0.0.1', port=4444, debug=False, threaded=True)


t = threading.Thread(target=appRun, args=())
t.start()


@app.route("/terminate", methods=['POST'])
@cross_origin(origin='localhost',headers=['Content- Type','Authorization'])
def playing():
    global statics, teams, users, bets, games

    teste = len(bets)
    teste= int(teste)
    key2 = request.headers.get('X-AUTH-TOKEN')
    user = [k for k, v in users.items() if key2 in v]
    user = str(user)
    user = user[2:]
    user = user[:-2]

    if [k for k, v in users.items() if key2 in v]:
        for x in range(0, int(teste/6)):
                test = list(statics[bets[0+x*6]])
                userMoney = test[-2]
                userWinning = test[-1]
                userMoney = float(userMoney)
                teamBet = bets[1+x*6]
                condiction = bets[2+x*6]
                oddBet = bets[3+x*6]
                moneyBet = bets[4+x*6]
                winBet = bets[5+x*6]

                if condiction == "Win":
                    userMoney += float(winBet)
                    userWinning += float(winBet) - float(moneyBet)
                    statics[bets[0+x*6]] += teamBet, condiction, oddBet, moneyBet, winBet, userMoney, userWinning
                else:
                    userWinning = userWinning - float(moneyBet)
                    statics[bets[0+x*6]] += teamBet, condiction, oddBet, moneyBet, winBet, userMoney, userWinning
        bets = []

        games.clear()
        msg = send_message("terminate", 1, "terminateOK")
        return json.dumps(msg)


    with open('statics.json', 'w') as outfile:
        json.dump(statics, outfile)


@app.route("/betInsert", methods=['POST'])
@cross_origin(origin='localhost',headers=['Content- Type', 'Authorization'])
def betInsert():
    global teams

    key2 = request.headers.get('X-AUTH-TOKEN')
    user = [k for k, v in users.items() if key2 in v]
    user = str(user)
    user = user[2:]
    user = user[:-2]
    team1 = request.form.get('equipa1', '').strip()
    team2 = request.form.get('equipa2', '').strip()

    if [k for k, v in users.items() if key2 in v]:
        s = dict()
        for x in stats:
            n = round(random.uniform(1, 3), 2)
            s.update({x: n})

        games.append({"team": len(games), "vs": (team1, team2), "stats": s})

        msg = send_message("bet", 1, "betregist")
        return json.dumps(msg)


def send_message(type, result, text):
    msg = dict()
    msg["type"] = type
    msg["result"] = result
    msg["text"] = text
    return msg

