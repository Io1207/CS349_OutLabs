import psycopg2
import requests

from config import PGDATABASE, PGUSER, PGPASSWORD, PGHOST

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

OLLAMA_URL = "http://localhost:11434/api/embed"

# TODO (Task 1.i): Choose the Ollama model to use for generating embeddings.
#                  Make sure this matches the model used in ragGen.py.
MODEL_NAME = "smollm2:135m"  # e.g. "smollm2:135m"


# ---------------------------------------------------------------------------
# Task 1 - Embedding Generation
# --------------------------------------------------------------------------

def get_embedding(text):
    """
    Sends the given text to the Ollama Embeddings API and returns the
    resulting embedding vector as a list of floats.

    TODO:
    - Build the request payload with the model name and input text.
    - Send a POST request to OLLAMA_URL.
    - Parse the JSON response and extract the embedding.
    - Return the embedding vector.
    """
    # TODO: Implement this function
    # build the request payload
    payload = {
        "model": MODEL_NAME,
        "input": text
    }
    # send a POST request to OLLAMA_URL
    response = requests.post(OLLAMA_URL, json=payload)
    # check if the request was successful
    if response.status_code == 200:
        # parse the JSON response and extract the embedding
        embedding = response.json().get("embeddings", [])[0]
        return embedding
    else:       
        print(f"Error: Received status code {response.status_code} from Ollama API")
        return []


def update_embeddings():
    """
    Connects to the imdb_staging PostgreSQL table, reads every row,
    generates an embedding for the 'overview' column using get_embedding(),
    and saves the result back into the 'embedding' column of that row.

    TODO:
    - Connect to the PostgreSQL database using psycopg2.
    - Fetch all rows (you need both 'ctid' and 'overview').
    - For each row:
        Calculate the embedding for the 'overview' column
    """
    # TODO: Implement this function
    # connect to the PostgreSQL database using psycopg2
    conn = psycopg2.connect(
        dbname=PGDATABASE,
        user=PGUSER,
        password=PGPASSWORD,
        host=PGHOST
    )
    conn.autocommit = False
    cur = conn.cursor()

    cur.execute("SELECT ctid, overview FROM imdb_staging;")
    rows = cur.fetchall()

    for i, (ctid, overview) in enumerate(rows):
        if not overview:
            continue

        print(f"Processing {i}/{len(rows)}", end="\r")

        embedding = get_embedding(overview)

        if embedding:
            vec_str = "[" + ",".join(map(str, embedding)) + "]"

            cur.execute(
                "UPDATE imdb_staging SET embedding = %s::vector WHERE ctid = %s;",
                (vec_str, ctid)
            )

        if i % 100 == 0:
            conn.commit()

    conn.commit()
    cur.close()
    conn.close()

def setup_database():
    conn = psycopg2.connect(dbname=PGDATABASE, user=PGUSER, password=PGPASSWORD, host=PGHOST)
    conn.autocommit = True
    cur = conn.cursor()

    cur.execute("DROP TABLE IF EXISTS imdb_staging;")

    cur.execute("""
        CREATE TABLE imdb_staging (
            Poster_Link TEXT,
            Series_Title TEXT,
            Released_Year TEXT,
            Certificate TEXT,
            Runtime TEXT,
            Genre TEXT,
            IMDB_Rating TEXT,
            Overview TEXT,
            Meta_score TEXT,
            Director TEXT,
            Star1 TEXT,
            Star2 TEXT,
            Star3 TEXT,
            Star4 TEXT,
            No_of_Votes TEXT,
            Gross TEXT,
            embedding vector(576)
        );
    """)

    csv_file_path = "imdb_top_1000.csv"
    
    with open(csv_file_path, 'r') as f:
        cur.copy_expert("COPY imdb_staging (Poster_Link, Series_Title, Released_Year, Certificate, Runtime, Genre, IMDB_Rating, Overview, Meta_score, Director, Star1, Star2, Star3, Star4, No_of_Votes, Gross) FROM STDIN WITH (FORMAT CSV, HEADER)", f)
        
    cur.close()
    conn.close()

if __name__ == "__main__":
    # setup_database() # Uncomment when you want to create/recreate the table and load data
    update_embeddings()
