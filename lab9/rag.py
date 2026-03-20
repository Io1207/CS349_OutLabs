from model import get_embedding

import psycopg2
import requests
import json

from config import PGDATABASE, PGUSER, PGPASSWORD, PGHOST

OLLAMA_EMBED_URL = "http://localhost:11434/api/embeddings"
OLLAMA_CHAT_URL = "http://localhost:11434/api/chat"

# Choose the Ollama model used in model.py
MODEL_NAME = "smollm2:135m"  # e.g. "smollm2:135m" 

def fetch_similar_rows(query_embedding, top_k=5):
    """
    Given a query embedding vector, searches the imdb_staging table for the
    top_k most semantically similar movie overviews using pgvector's
    L2 distance operator (<->). Experiment with other operators.
    """

    # TODO: Implement this function
    # - Connect to the PostgreSQL database using psycopg2.
    # - Convert the query_embedding list to a string format suitable for SQL (e.g. '[0.1, 0.2, ...]').
    # - Execute a SQL query that selects the 'overview' column from imdb_staging, ordered by the distance between the stored embedding and the query_embedding, using the appropriate operator (e.g. <-> for L2 distance).  
    # - Fetch the top_k results and return them as a list of strings.
    conn = psycopg2.connect(dbname=PGDATABASE, user=PGUSER, password=PGPASSWORD, host=PGHOST)
    cur = conn.cursor()
    vec_str = '[' + ','.join(map(str, query_embedding)) + ']'
    cur.execute(f"SELECT overview FROM imdb_staging ORDER BY embedding <-> %s::vector LIMIT %s;", (vec_str, top_k))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [row[0] for row in rows]

def generate_response(prompt):
    payload = {
        "model": MODEL_NAME,
        "stream": False,
        "messages": [
            {"role": "system", "content": "You are a helpful assistant that answers questions based on the provided movie overviews."},
            {"role": "user", "content": prompt}
        ]
    }

    response = requests.post(OLLAMA_CHAT_URL, json=payload)

    if response.status_code == 200:
        data = response.json()
        return data['message']['content']
    else:
        print(f"Error: {response.status_code}")
        return "Sorry, I couldn't generate a response."
    
    
def rag_query(user_query):
    query_embedding = get_embedding(user_query)
    
    similar_overviews = fetch_similar_rows(query_embedding, top_k=5)
    
    context = "\n\n".join(similar_overviews)

    prompt = f"Based on the following movies names:\n\n{context}\n\nAnswer the following question:\n{user_query}\nAnswer:"
    
    return generate_response(prompt)


if __name__ == "__main__":
    user_query = input("Enter your query: ")
    answer = rag_query(user_query)
    print("Response:", answer)