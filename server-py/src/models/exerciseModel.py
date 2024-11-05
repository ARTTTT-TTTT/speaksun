from pydantic import BaseModel
from typing import List, Optional

class AlphabetModel(BaseModel):
    alphabet: Optional[str]
    image_file: Optional[str]
    mp3_file: Optional[str]
    class Config:
        json_schema_extra = {
            "example": {
                "alphabet": "สอ เสือ",
                "image_file": "_id",
                "mp3_file": "_id"
            }
        }

class ExerciseModel(BaseModel):
    exercise_id: Optional[int]
    alphabets: Optional[List[AlphabetModel]]
    class Config:
        json_schema_extra = {
            "example": {
                "exercise_id": 1,
                "alphabets": [
                    {
                        "alphabet": "สอ เสือ",
                        "image_file": "/images/_id",
                        "mp3_file": "/mp3/_id"
                    }
                ]
            }
        }

class ExerciseIdModel(BaseModel):
    exercise_id: Optional[int]
    class Config:
        json_schema_extra = {
            "example": {
                "exercise_id": 1
            }
        }