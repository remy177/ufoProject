# make sure to include blueprints - taken from shanes code in resources
from flask import Flask, render_template, redirect, Blueprint
import scrape_costa

# add a header to each response
@app.after_request
def after_request(response):
        header = response.headers
        header['Access-Control-Allow-Origin'] = '*'
        return response

# Create an instance of Flask
app = Flask(__name__)

# from class demo including PyMongo - but we are using SQL 
# Use PyMongo to establish Mongo connection
#mongo = PyMongo(app, uri="mongodb://localhost:27017/weather_app")

#How to establish connection to SQL database?
from flask_sqlalchemy import SQLAlchemy 
db = SQLAlchemy()

# Route to render index.html template using data from SQL
@app.route("/")
def home():

    # Find one record of data from the SQL database
        # Mongo Demo Code:
        #destination_data = mongo.db.collection.find_one()

    # Return template and data
    return render_template("index.html", vacation=destination_data)

# Route to get data 
@app.route("/api")
def api():

    # Find one record of data from the database
    # because of object id failure: 
    #destination_data = mongo.db.collection.find_one({}, {'_id': False}) for mango demonstration
    destinations = [destination for destination in destination_data]
    data = {
        "destinations": destinations
    }

    # Return template and data
    return jsonify(data)

# Route that will trigger the scrape function
@app.route("/scrape")
def scrape():

    # Run the scrape function
    costa_data = scrape_costa.scrape_info()

    # Update the database using update and upsert=True
    #From mongo demonstration
     #mongo.db.collection.update({}, costa_data, upsert=True)

    # Redirect back to home page
    return redirect("/")


if __name__ == "__main__":
    app.run(debug=True)
