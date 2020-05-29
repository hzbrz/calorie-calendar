from flask import Flask, request, jsonify
from flask_cors import CORS
import pymongo
import datetime
from dateutil import relativedelta
from bson import ObjectId
import json
import base64

with open("monog.txt", 'r') as infile:
  mongopass = infile.read()

# create a collection with 90 days with 3 months seperated with 30 days

app = Flask(__name__)

CORS(app)
# myclient = pymongo.MongoClient("mongodb://localhost:27017/")

# if heroku request times out that means that the mongodb atlsat network access does not have permission for that IP address
# In this case I just whitelist by adding 0.0.0.0/0 which allows all connections 
myclient = pymongo.MongoClient("mongodb+srv://hz1:" + mongopass + "@caloriecluster-bmq1f.mongodb.net/test?retryWrites=true&w=majority")
mydb = myclient["calendarDB"]
calendar_coll = mydb["calendars"]
calorie_coll = mydb["calories"]
user_coll = mydb["users"]



today = datetime.datetime.today()
next_month = datetime.date.today() + relativedelta.relativedelta(months=1)
next_month_two = datetime.date.today() + relativedelta.relativedelta(months=2)
month_name = today.strftime("%B")
month_name_one = next_month.strftime("%B")
month_name_two = next_month_two.strftime("%B")



# ----------------------- HEROKU TEST ROUTE ------------------------
@app.route("/")
def index():
  return '<h1>HEROKU DEPLOYED</h1>'


# --------------- CALENDAR METHODS -----------------------------
@app.route("/calendar", methods=["POST"])
def create_calendar():
  calendar_dict = {
    month_name: {
      "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
      "11": 11, "12": 12, "13": 13, "14": 14, "15": 15, "16": 16, "17": 17, "18": 18, "19": 19,
      "20": 20, "21": 21, "22": 22, "23": 23, "24": 24, "25": 25, "26": 26, "27": 27, "28": 28, "29": 29
    },
    month_name_one: {
      "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
      "11": 11, "12": 12, "13": 13, "14": 14, "15": 15, "16": 16, "17": 17, "18": 18, "19": 19, 
      "20": 20, "21": 21, "22": 22, "23": 23, "24": 24, "25": 25, "26": 26, "27": 27, "28": 28, "29": 29
    },
    month_name_two: {
      "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
      "11": 11, "12": 12, "13": 13, "14": 14, "15": 15, "16": 16, "17": 17, "18": 18, "19": 19, 
      "20": 20, "21": 21, "22": 22, "23": 23, "24": 24, "25": 25, "26": 26, "27": 27, "28": 28, "29": 29
    }
  }

  calendar_entry = calendar_coll.insert_one(calendar_dict)
  response = jsonify({"message": "Calendar created!", "calendar_id": str(calendar_entry.inserted_id)})
  return response

@app.route("/calorie", methods=["POST"])
def create_calorie():
  calorie_dict = {
    month_name: {},
    month_name_one: {},
    month_name_two: {}
  }

  calorie_entry = calorie_coll.insert_one(calorie_dict)
  response = jsonify({"message": "Calorie Calendar created!", "calorie_id": str(calorie_entry.inserted_id)})
  return response

@app.route("/calendar/<calendar_id>", methods=["GET"])
def get_calendar(calendar_id):
  # tunring the str id to ObjectId since that is the format mongodb id's are stored as
  calendar_id = ObjectId(calendar_id)
  # then write the query
  calendar_query = {"_id": calendar_id}
  calendar = calendar_coll.find(calendar_query)

  if calendar.count() == 0:
    return jsonify({"message": "Calendar not found"})

  for c in calendar:
    del c["_id"]
    # I do this to maintain the same order of the dict, because JSON alphabetically orders in the response
    new_calendar = [
      [{ list(c.keys())[0]: list(c.values())[0] }], 
      [{ list(c.keys())[1]: list(c.values())[1] }], 
      [{ list(c.keys())[2]: list(c.values())[2] }] 
    ]
    return jsonify({ "message": "Calendar Found!", "Calendar": new_calendar })


@app.route("/calendar/<calendar_id>", methods=["POST"])
def mark_calendar(calendar_id):
  data = request.get_json()
  
  calendar_id = ObjectId(calendar_id)
  calendar_query = {"_id": calendar_id}
  calendar = calendar_coll.find(calendar_query)

  if calendar.count() == 0:
    return jsonify({"message": "Calendar not found"})

  for c in calendar:
    # this is how you update a dictionary in mongodb
    c[data["month"]][data["day"]] = "X"
    update = calendar_coll.find_one_and_update(
      {"_id": c["_id"]},
      {"$set": {data["month"]: c[data["month"]]} }
    ) 
    # getting the values of the udpated month
    updated_month = c[data["month"]]  

  # returning just the updated month to the client and not the other months
  return jsonify({"message": "calendar marked", "update": updated_month})

# same as the POST method except it changes the "X" to the number of the day thus "unmarking the calendar"
@app.route("/calendar/<calendar_id>", methods=["PUT"])
def unmark_calendar(calendar_id):
  data = request.get_json()
  
  calendar_id = ObjectId(calendar_id)
  calendar_query = {"_id": calendar_id}
  calendar = calendar_coll.find(calendar_query)

  if calendar.count() == 0:
    return jsonify({"message": "Calendar not found"})

  for c in calendar:
    c[data["month"]][data["day"]] = int(data["day"])
    update = calendar_coll.find_one_and_update(
      {"_id": c["_id"]},
      {"$set": {data["month"]: c[data["month"]]} }
    ) 
    updated_month = c[data["month"]]  

  # returning just the updated month to the client and not the other months
  return jsonify({"message": "calendar UNmarked", "update": updated_month})


# helper func to get the scraped data
def calorie_getter(calorie_id):
  calorie_id = ObjectId(calorie_id)
  calorie_query = {"_id": calorie_id}
  calorie = calorie_coll.find(calorie_query)
  if calorie.count() == 0:
    return None

  for cal in calorie:
    del cal["_id"]
    return cal

@app.route("/calorie/<calendar_id>/<calorie_id>", methods=["POST"])
def mark_calorie(calendar_id, calorie_id):
  calorie_goal = request.get_json()["calorie"]

  data = calorie_getter(calorie_id)
  # if the id was wrong or a calorie calendar was not found in the getter func
  if data:
    months = list(data.keys())
  else:
    return jsonify({ "message": "Calorie calendar not found!" })

  calendar_id = ObjectId(calendar_id)
  calendar_query = {"_id": calendar_id}
  calendar = calendar_coll.find(calendar_query)
  if calendar.count() == 0:
    return jsonify({"message": "Calendar not found"})

  for c in calendar:
    for month in months:
      print(month)
      for day in list(data[month].keys()):
        if int(calorie_goal)+100 >= int(data[month][day]["calories"]):
          c[month][day] = "X"
        else:
          c[month][day] = int(day)
        
      update = calendar_coll.find_one_and_update(
        {"_id": c["_id"]},
        {"$set": { month: c[month] } }
      )

  return jsonify({ "message": "calorie marked"})

# debug mode method
# @app.route("/drop", methods=["GET"])
# def drop_collection():
#   calendar_coll.drop()

#   return jsonify({ "message": "collection dropped!" })

# --------------- END CALENDAR METHODS -----------------------------

# -------------------------- USER METHODS -----------------------------
@app.route("/user", methods=["POST"])
def signup():
  data = request.get_json()

  pass_string = data["password"]
  # turning into string so I can encode into ascii and then encode into bytes
  update_string = str(pass_string)
  ascii_dict = update_string.encode('ascii')
  output_byte = base64.b64encode(ascii_dict)
  data["password"] = output_byte 

  calorie_id = ObjectId(data["calorie_id"])
  calendar_id = ObjectId(data["calendar_id"])

  user_query = {"email": data["email"]}
  user = user_coll.find(user_query)
  # cehcking if the user already exists and signing up the user if he/she doesnt exist
  if user.count() == 0:
    user_entry = user_coll.insert_one(data)
    return jsonify({ "message": "signup successful" })
  # else the user doesnt get created and none of the tables get created
  else:
    calorie_delete_query = { "_id": calorie_id }
    calorie_coll.delete_one(calorie_delete_query)
    calendar_delete_query = { "_id": calendar_id }
    calendar_coll.delete_one(calendar_delete_query)
    return jsonify({ "message": "signup UNsuccessful, user already exists" })


@app.route("/login", methods=["POST"])
def login():
  data = request.get_json()

  print(data)
  user_query = {"email": data["email"]}
  user = user_coll.find(user_query)
  # user_arr = list(user)
  # print(user_arr)
  if user.count() == 0:
    return ({ "message": "Login unsuccessful, user not found", "user_data": "redirect" })

  for u in user:
    print(u)
    del u["password"]
    del u["_id"]
    del u["email"]
    print(u)
    return ({ "meassage": "Login successful", "user_data": u })



if __name__ == "__main__":
  app.run()

