#importando a coneção com o banco
import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv("config.env")

#conectando no banco
def banco_calabreso():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )
