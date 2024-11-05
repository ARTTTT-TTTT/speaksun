from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from dotenv import load_dotenv
import urllib.parse
import os

load_dotenv()

#------------------ Settings MongoDB database ---------------------------------
MONGODB_USERNAME = os.getenv("MONGODB_USERNAME")
MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD")
MONGODB_URI = os.getenv("MONGODB_URI")

# ทำการ encode ค่า username และ password
quoted_username = urllib.parse.quote_plus(MONGODB_USERNAME)
quoted_password = urllib.parse.quote_plus(MONGODB_PASSWORD)


uri = f"mongodb+srv://{quoted_username}:{quoted_password}{MONGODB_URI}"

#------------------------Development---------------------------
DB_URL = os.environ.get("DB_URL", uri)
#DB_URL = os.environ.get("DB_URL", "mongodb://localhost:27017")
#--------------------------------------------------------------

client = AsyncIOMotorClient(DB_URL)
db = client["speaksun"]
users_collection = db['users']
exercises_collection = db['exercises']
images_collection = db['images.files']
mp3_collection = db['mp3.files']
mp4_collection = db['mp4.files']
#fs = AsyncIOMotorGridFSBucket(db)
image_fs = AsyncIOMotorGridFSBucket(db, bucket_name='images')
mp3_fs = AsyncIOMotorGridFSBucket(db, bucket_name='mp3')
mp4_fs = AsyncIOMotorGridFSBucket(db, bucket_name='mp4')
#wav_fs = AsyncIOMotorGridFSBucket(db, bucket_name='wav')
#------------------------------------------------------------------------------