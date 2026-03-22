import os
import mysql.connector


def get_connection():
    """
    Central MySQL connection factory.
    Uses environment variables so it works both locally and with Docker.
    """
    return mysql.connector.connect(
        host="127.0.0.1",   # IMPORTANT
        user="root",
        password="rootpass",  # from docker inspect
        database="swims",
        port=3306            # IMPORTANT
    )