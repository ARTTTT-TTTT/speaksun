from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from bson import ObjectId

from .progressionModel import ProgressionModel

class UpdateUserProfileModel(BaseModel):
    progressions: Optional[List[ProgressionModel]]

class UserCreateModel(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    password: str

class ReadUserProfileModel(BaseModel):
    username: str
    age: Optional[str] = None
    gender: Optional[str] = None
    congenital_disorders: Optional[str] = None

    class Config:
        #arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "username": "johndoe",
                "age": "1990-01-01",
                "gender": "male",
                "congenital_disorders": "None",
            }
        }

class UserModel(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    password: str
    role: str = "user"
    age: Optional[str] = None
    gender: Optional[str] = None
    congenital_disorders: Optional[str] = None
    progressions: Optional[List[ProgressionModel]] = []

    class Config:
        #arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "email": "john.doe@example.com",
                "username": "johndoe",
                "first_name": "John",
                "last_name": "Doe",
                "password": "hashed_password",
                "role": "user",
                "age": "1990-01-01",
                "gender": "male",
                "congenital_disorders": "None",
                "progressions": [
                    {
                        "exercise_id": 1,
                        "percent": 20,
                        "alphabets_result": [
                            {
                                "alphabet": "สอ เสือ",
                                "count": 1,
                                "correct": 1,
                                "incorrect": 1
                            },
                        ]
                    }
                ]
            }
        }