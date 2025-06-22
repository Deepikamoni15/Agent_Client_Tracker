from flask import Flask, request, jsonify, render_template
import mysql.connector

app = Flask(__name__)

# MySQL Configuration
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "root",  # Change if necessary
    "database": "tracker_db"
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

@app.route("/")
def home():
    return render_template("index.html")  # Flask will look in 'templates/'

@app.route("/add_interaction", methods=["POST"])
def add_interaction():
    agent = request.form.get("agent")
    client = request.form.get("client")
    interaction = request.form.get("interaction")

    print(f"Received: agent={agent}, client={client}, interaction={interaction}")  # Debugging

    if not agent or not client or not interaction:
        return jsonify({"error": "All fields are required!"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("INSERT INTO interactions (agent, client, interaction) VALUES (%s, %s, %s)", 
                    (agent, client, interaction))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Interaction added successfully!"})
    except mysql.connector.Error as err:
        print(f"Database Error: {err}")  # Debugging
        return jsonify({"error": "Database error"}), 500

@app.route("/get_interactions", methods=["GET"])
def get_interactions():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT agent, client, interaction FROM interactions")
    interactions = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([{"agent": row[0], "client": row[1], "interaction": row[2]} for row in interactions])

if __name__ == "__main__":
    app.run(debug=True)
