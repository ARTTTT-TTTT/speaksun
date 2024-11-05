
from fastapi import APIRouter, HTTPException
from typing import List
from bson import ObjectId
from fastapi.responses import StreamingResponse

from ..models.exerciseModel import ExerciseIdModel, ExerciseModel, AlphabetModel
from ..database import exercises_collection, mp3_collection, images_collection, image_fs

router = APIRouter()

@router.get("/images/{file_id}")
async def get_image(file_id: str):
    try:
        file_id = ObjectId(file_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid file ID format")

    try:
        file = await image_fs.open_download_stream(file_id)
    except Exception:
        raise HTTPException(status_code=404, detail="File not found")

    return StreamingResponse(file, media_type="image/png")

@router.get("/{exercise_id}", response_model=ExerciseModel)
async def read_exercise(exercise_id: int):
    exercise = await exercises_collection.find_one({"exercise_id": exercise_id})
    if not exercise:
        raise HTTPException(status_code=404, detail=f"Exercise with id {exercise_id} not found")

    if "alphabets" in exercise:
        for alphabet in exercise["alphabets"]:
            if alphabet.get("image_file"):
                # Update image_file to URL
                alphabet["image_file"] = str(alphabet['image_file'])
            if alphabet.get("mp3_file"):
                # Update mp3_file to URL
                alphabet["mp3_file"] = str(alphabet['mp3_file'])
                
    return ExerciseModel(**exercise)

@router.get("/{exercise_id}/cursor/{alphabet}", response_model=AlphabetModel)
async def read_alphabet(exercise_id: int, alphabet: str):
    # Find the exercise document by exercise_id
    exercise = await exercises_collection.find_one({"exercise_id": exercise_id})
    
    if not exercise:
        raise HTTPException(status_code=404, detail=f"Exercise with id {exercise_id} not found")
    
    # Find the specific alphabet within the exercise
    alphabet_data = next((a for a in exercise.get("alphabets", []) if a.get("alphabet") == alphabet), None)
    
    if not alphabet_data:
        raise HTTPException(status_code=404, detail=f"Alphabet {alphabet} not found in exercise {exercise_id}")
    
    # Update URLs for image and mp3 files
    if alphabet_data.get("image_file"):
        alphabet_data["image_file"] = str(alphabet_data["image_file"])
    if alphabet_data.get("mp3_file"):
        alphabet_data["mp3_file"] = str(alphabet_data["mp3_file"])
    
    return AlphabetModel(**alphabet_data)


@router.get("/exercise_ids/cursor", response_model=List[ExerciseIdModel])
async def list_exercise_ids():
    try:
        exercise_ids_cursor = exercises_collection.find({}, {"exercise_id": 1, "_id": 0})
        exercise_ids = await exercise_ids_cursor.to_list(length=None)
        return [ExerciseIdModel(exercise_id=item["exercise_id"]) for item in exercise_ids]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[ExerciseModel])
async def list_exercises():
    exercises = []
    async for exercise in exercises_collection.find():
        exercises.append(exercise)
    return exercises

@router.post("/", response_model=ExerciseModel)
async def create_exercise(exercise: ExerciseModel):
    alphabets = exercise.alphabets

    if not alphabets:
        raise HTTPException(status_code=400, detail="No alphabets provided")

    for alphabet in alphabets:
        if alphabet.alphabet:
            mp3_filename = f"{alphabet.alphabet}.mp3"
            image_filename = f"{alphabet.alphabet}.png"
            
            mp3_file_obj = await mp3_collection.find_one({"filename": mp3_filename})
            if mp3_file_obj:
                alphabet.mp3_file = str(mp3_file_obj['_id'])
            else:
                raise HTTPException(status_code=404, detail=f"Audio file {mp3_filename} not found in mp3 collection")

            image_file_obj = await images_collection.find_one({"filename": image_filename})
            if image_file_obj:
                alphabet.image_file = str(image_file_obj['_id'])
            else:
                raise HTTPException(status_code=404, detail=f"Image file {image_filename} not found in image collection")

    exercise_dict = exercise.dict()
    result = await exercises_collection.insert_one(exercise_dict)
    exercise_dict["_id"] = str(result.inserted_id)

    return exercise_dict

@router.put("/{exercise_id}", response_model=ExerciseModel)
async def update_exercise(exercise_id: str, exercise_update: ExerciseModel):
    existing_exercise = await exercises_collection.find_one({"_id": ObjectId(exercise_id)})
    
    if not existing_exercise:
        raise HTTPException(status_code=404, detail=f"Exercise with id {exercise_id} not found")
    
    # Prepare update data
    update_data = exercise_update.dict(exclude_unset=True)
    
    # Perform the update
    update_result = await exercises_collection.update_one(
        {"_id": ObjectId(exercise_id)},
        {"$set": update_data}
    )
    
    if update_result.modified_count == 1:
        updated_exercise = await exercises_collection.find_one({"_id": ObjectId(exercise_id)})
        updated_exercise["_id"] = str(updated_exercise["_id"])
        return updated_exercise
    
    raise HTTPException(status_code=500, detail=f"Failed to update exercise with id {exercise_id}")

@router.patch("/{exercise_id}", response_model=ExerciseModel)
async def patch_exercise(exercise_id: str, exercise_update: ExerciseModel):
    existing_exercise = await exercises_collection.find_one({"_id": ObjectId(exercise_id)})
    if existing_exercise:
        update_data = exercise_update.dict(exclude_unset=True)
        
        if "alphabets" in update_data and isinstance(update_data["alphabets"], list):
            for alphabet in update_data["alphabets"]:
                if alphabet.get("alphabet"):
                    mp3_filename = f"{alphabet['alphabet']}.mp3"
                    image_filename = f"{alphabet['alphabet']}.png"

                    # Handle MP3 file
                    mp3_file_obj = await mp3_collection.find_one({"filename": mp3_filename})
                    if mp3_file_obj:
                        alphabet["mp3_file"] = str(mp3_file_obj['_id'])
                    else:
                        raise HTTPException(status_code=404, detail=f"Audio file {mp3_filename} not found in mp3 collection")

                    # Handle Image file
                    image_file_obj = await images_collection.find_one({"filename": image_filename})
                    if image_file_obj:
                        alphabet["image_file"] = str(image_file_obj['_id'])
                    else:
                        raise HTTPException(status_code=404, detail=f"Image file {image_filename} not found in image collection")

            existing_alphabets = existing_exercise.get("alphabets", [])
            update_alphabets = [AlphabetModel(**char) for char in update_data["alphabets"]]
            updated_alphabets = existing_alphabets + [char.dict() for char in update_alphabets]
            update_data["alphabets"] = updated_alphabets
        
        update_result = await exercises_collection.update_one(
            {"_id": ObjectId(exercise_id)},
            {"$set": update_data}
        )
        if update_result.modified_count == 1:
            updated_exercise = await exercises_collection.find_one({"_id": ObjectId(exercise_id)})
            updated_exercise["_id"] = str(updated_exercise["_id"])
            return updated_exercise
        raise HTTPException(status_code=500, detail=f"Failed to update exercise with id {exercise_id}")
    
    raise HTTPException(status_code=404, detail=f"Exercise with id {exercise_id} not found")

    
@router.delete("/{exercise_id}", response_model=dict)
async def delete_exercise(exercise_id: str):
    delete_result = await exercises_collection.delete_one({"_id": ObjectId(exercise_id)})
    if delete_result.deleted_count == 1:
        return {"status": f"Exercise with id {exercise_id} deleted"}
    raise HTTPException(status_code=404, detail=f"Exercise with id {exercise_id} not found")
