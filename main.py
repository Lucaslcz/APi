from flask import Flask

#criando o app do flask
app = Flask(__name__)

#importando as rotas
from routes import *


if __name__== "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)