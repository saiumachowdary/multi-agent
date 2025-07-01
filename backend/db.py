from pymongo import MongoClient
from os import getenv

MONGO_URL = getenv("MONGO_URL", "mongodb+srv://abhizgn1026:5nVJkTYWN6d0q3my@cluster0.wzp4ld5.mongodb.net/developer-agents?retryWrites=true&w=majority&appName=Cluster0")
client = MongoClient(MONGO_URL)
db = client["dev_flow_orchestrator"]
users_collection = db["users"]
