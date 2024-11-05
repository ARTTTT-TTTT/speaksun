from typing import Optional,List
from pydantic import BaseModel

class AlphabetModel(BaseModel):
    alphabet: Optional[str]
    count: Optional[int]
    correct: Optional[int]
    incorrect: Optional[int]
    class Config:
        json_schema_extra = {
            "example":{
                    "alphabet": "สอ เสือ",
                    "count": 1,
                    "correct": 1,
                    "incorrect": 1
            }
        }
        
#"example":{
#                    "week": 1,
#                    "alphabet": "สอ เสือ",
#                    "count": 1,
#                    "correct": 1,
#                    "incorrect": 1,
#                    "maxPercent": 20
#}

class ProgressionModel(BaseModel):
    exercise_id: Optional[int]
    percent: Optional[int]
    alphabets_result: Optional[List[AlphabetModel]]
    class Config:
        json_schema_extra = {
            "example":{
                    "exercise_id": 1,
                    "percent": 20,
                    "alphabets_result": [
                        {            
                            "alphabet": "สอ เสือ",
                            "count": 1,
                            "correct": 1,
                            "incorrect": 1
                        }
                    ]
            }
        }

class ProgressionPercentModel(BaseModel):
    exercise_id: Optional[int]
    percent: Optional[int]
    class Config:
        json_schema_extra = {
            "example":{
                    "exercise_id": 1,
                    "percent": 20,
            }
        }