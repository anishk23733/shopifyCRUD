import flask
from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS, cross_origin
from pymongo import MongoClient
from datetime import datetime

mongo_client = MongoClient('localhost', 27017)
db = mongo_client['shopifydb']
coll = db['inventory']

app = Flask(__name__)
CORS(app)

def generate_inventory():
    response = jsonify({'inventory': list(coll.find({}))})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/get_items', methods=['GET'])
def get_items():
    return generate_inventory()

@app.route('/edit_item', methods=['POST'])
def edit_item():
    raw_item = request.get_json()
    raw_item["last_updated"] = datetime.utcnow()
    coll.update_one({'_id': raw_item['_id']}, {'$set': raw_item})

    return generate_inventory()

@app.route('/create_item', methods=['POST'])
def create_item():
    raw_item = request.get_json()
    raw_item["date_added"] = datetime.utcnow()
    coll.insert_one(raw_item)

    return generate_inventory()

@app.route('/delete_item', methods=['POST'])
def delete_item():
    raw_item = request.get_json()
    coll.delete_one({"_id": raw_item["_id"]})

    return generate_inventory()

if __name__ == '__main__':
    app.run()
