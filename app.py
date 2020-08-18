import os
basedir = os.path.abspath(os.path.dirname(__file__)) 
#_file_ temporary name space of file 


class Config(object):
    DEBUG = True
    TESTING = False
    CSRF_ENABLED = True
    SECRET_KEY = 'this-really-needs-to-be-changed'
    SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']
#see where secret key is being used (being declared here)
# reference previous file for database url but example : DATABASE_URL="postgresql:///wordcount_dev"
# return data from json via the URL to the html/js pushing from the back end to front end 
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os


app = Flask(__name__)
app.config.from_object(os.environ['APP_SETTINGS'])
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

#pull from database to serve engine, 
@app.route('/')
def hello():
    return "Hello World!"


@app.route('/<name>')
def hello_name(name):
    return jsonify(data)

if __name__ == '__main__':
    app.run()
    #debug=True for testing purposes 