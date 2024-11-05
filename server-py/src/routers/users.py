from fastapi import APIRouter, HTTPException, status, Depends

from ..models.userModel import UserModel, UpdateUserProfileModel, ReadUserProfileModel
from ..auth.auth import get_current_user
from ..database import users_collection

router = APIRouter()

@router.get("/profile", response_model=ReadUserProfileModel)
async def read_user_profile(current_user: ReadUserProfileModel = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UpdateUserProfileModel)
async def update_user_profile(
    user_info: UpdateUserProfileModel,
    current_user: UserModel = Depends(get_current_user)
):
    update_data = {k: v for k, v in user_info.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data to update"
        )
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_data}
    )
    return update_data