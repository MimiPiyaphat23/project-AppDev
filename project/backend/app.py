from flask import Flask
from db import get_connection

app = Flask(__name__)

@app.route("/")
def hello():
    return "hello world"

@app.route("/testdb")
def testdb():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT 1")

    return "Database Connected"
    

if __name__ == "__main__":
    app.run(debug=True)