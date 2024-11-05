from fastapi import APIRouter, Request, HTTPException
from authlib.integrations.starlette_client import OAuth
from fastapi.responses import RedirectResponse
from pymongo.errors import PyMongoError
from starlette.config import Config
from dotenv import load_dotenv
from pydantic import BaseModel
from jose import jwt
import os

from .auth import SECRET_KEY, ALGORITHM
from ..database import users_collection
from ..models.userModel import UserModel

# Load environment variables from .env file
load_dotenv()

# Get redirect URL from environment variable
REDIRECT_URL = os.getenv("REDIRECT_URL")

# Configure OAuth
config = Config('.env')
oauth = OAuth(config)
CONF_URL = 'https://accounts.google.com/.well-known/openid-configuration'
oauth.register(
    name='google',
    server_metadata_url=CONF_URL,
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    access_token_url='https://oauth2.googleapis.com/token',
    client_kwargs={'scope': 'openid profile email'},
    jwks_uri='https://www.googleapis.com/oauth2/v3/certs',
)

router = APIRouter()

class Token(BaseModel):
    access_token: str
    token_type: str

@router.get('/login/google')
async def google_login(request: Request):
    redirect_uri = request.url_for('google_auth')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get('/auth/google')
async def google_auth(request: Request):
    try:
        # Exchange authorization code for access token
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to fetch user information from Google.")
        
        # Check if user exists in database
        user = await users_collection.find_one({"email": user_info['email']})
        
        if user:
            user['_id'] = str(user['_id'])
            access_token = jwt.encode({"sub": user["email"]}, SECRET_KEY, algorithm=ALGORITHM)
        else:
            # Create new user if not found
            user_data = {
                'email': user_info['email'],
                'username': user_info['email'].split('@')[0],
                'first_name': user_info['given_name'],
                'last_name': user_info['family_name'],
                'password': '',  # Password is empty for OAuth login
                'role': 'user',
                'age': None,
                'gender': None,
                'congenital_disorders': None,
                'progression': []
            }
            new_user = UserModel(**user_data)
            await users_collection.insert_one(new_user.dict(by_alias=True))
            
            new_user_dict = new_user.dict(by_alias=True)
            new_user_dict['_id'] = str(new_user_dict['_id'])
            access_token = jwt.encode({"sub": new_user_dict["email"]}, SECRET_KEY, algorithm=ALGORITHM)
        
        # Redirect to the frontend with the token in a cookie
        response = RedirectResponse(url=REDIRECT_URL + f"?access_token={access_token}")
        response.set_cookie(key="token", value=access_token, httponly=True, secure=True, samesite='Lax')
        return response
    
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
