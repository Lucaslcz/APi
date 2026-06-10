from flask import Flask

#criando o app do flask
app = Flask(__name__)

#importando as rotas
from routes import *


if __name__== "__main__":
    app.run()