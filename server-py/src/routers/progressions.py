from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from typing import List

from ..models.progressionModel import ProgressionPercentModel
from ..models.userModel import UserModel
from ..auth.auth import get_current_user
from ..database import users_collection

router = APIRouter()

@router.get("/percent", response_model=List[ProgressionPercentModel])
async def list_progressions_percent(current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user["_id"]  # Use "_id" to find the user in MongoDB
        # Find user and extract progressions
        user = await users_collection.find_one({"_id": user_id}, {"progressions": 1})

        if user is None:
            raise HTTPException(status_code=404, detail="User not found")

        progressions = user.get("progressions", [])

        # Extract exercise_id and percent from progressions
        result = [
            ProgressionPercentModel(
                exercise_id=prog.get("exercise_id"),
                percent=prog.get("percent")
            ) for prog in progressions if prog.get("exercise_id") is not None and prog.get("percent") is not None
        ]

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/{exercise_id}/percent", response_model=ProgressionPercentModel)
async def read_progressions_percent(
    exercise_id: int,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["_id"]

    # Find user by id and get only progressions field
    user = await users_collection.find_one({"_id": user_id}, {"progressions": 1})

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    progressions = user.get("progressions", [])

    progression = next((prog for prog in progressions if prog.get("exercise_id") == exercise_id), None)

    if progression is None:
        raise HTTPException(status_code=404, detail="Progression not found for the given exercise_id")

    return ProgressionPercentModel(
        exercise_id=progression.get("exercise_id"),
        percent=progression.get("percent")
    )