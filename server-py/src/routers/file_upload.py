from fastapi import APIRouter,HTTPException, UploadFile, File, status
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from fastapi.responses import StreamingResponse
from typing import Union, AsyncGenerator, List
from urllib.parse import quote
from bson import ObjectId
import numpy as np
import tempfile
import librosa
import joblib
import os

from ..database import mp3_fs, mp4_fs, image_fs
router = APIRouter()

async def get_file_stream(file_id: ObjectId) -> AsyncGenerator[bytes, None]:
    grid_out = await image_fs.open_download_stream(file_id)
    while True:
        chunk = await grid_out.readchunk()
        if not chunk:
            break
        yield chunk

def extract_mfcc2(audio, sr, duration=3):
    target_length = sr * duration
    if len(audio) < target_length:
        audio = np.pad(audio, (0, target_length - len(audio)), mode='constant')
    elif len(audio) > target_length:
        audio = audio[:target_length]
    
    mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)
    mfccs_flat = mfccs.reshape(-1)
    
    return mfccs_flat

@router.post("/wav_prediction/")
async def upload_wav_prediction(file: UploadFile = File(...)) -> Union[int, str]:
    try:
        current_dir = os.path.dirname(__file__)
        model_filename = os.path.join(current_dir, "../models/logistic_regression_model.pkl")
        loaded_model = joblib.load(model_filename)
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(await file.read())
            temp_file_path = temp_file.name

        audio, sr = librosa.load(temp_file_path, sr=None)
        mfccs_flat = extract_mfcc2(audio, sr, duration=3)
        mfccs_flat = np.array(mfccs_flat).reshape(1, -1)

        #desired_size = 3666

        #zeros_to_add = desired_size - mfccs_flat.size
        #extended_array = np.pad(mfccs_flat, (0, zeros_to_add), 'constant')
        #limited_array = extended_array[:3666]
        #new_predictions = loaded_model.predict(limited_array)
        new_predictions = loaded_model.predict(mfccs_flat)
        prediction = new_predictions[0]
        os.remove(temp_file_path)

        return prediction

    except Exception as e:
        return str(e)

async def upload_files(files: List[UploadFile], allowed_content_types: List[str], fs_bucket: AsyncIOMotorGridFSBucket) -> List[str]:
    file_ids = []
    for file in files:
        if file.content_type not in allowed_content_types:
            raise HTTPException(status_code=400, detail=f"Invalid file type for file {file.filename}. Allowed file types are {', '.join(allowed_content_types)}.")
        
        file_id = await fs_bucket.upload_from_stream(file.filename, file.file)
        file_ids.append(str(file_id))
    return file_ids

@router.post("/images/")
async def upload_images(image_files: List[UploadFile] = File(...)):
        file_ids = []
        for image_file in image_files:
            file_content = await image_file.read()
            
            file_id = await image_fs.upload_from_stream(image_file.filename, file_content)
            file_ids.append(str(file_id))
        
        return {"image_file_ids": file_ids}

#@router.post("/wav/")
#async def upload_wav(wav_files: List[UploadFile] = File(...)):
#    wav_file_ids = await upload_files(wav_files, ['audio/wav'], wav_fs)
#    return {"wav_file_ids": wav_file_ids}

@router.post("/mp3/")
async def upload_mp3(mp3_files: List[UploadFile] = File(...)):
    mp3_file_ids = await upload_files(mp3_files, ['audio/mpeg'], mp3_fs)
    return {"mp3_file_ids": mp3_file_ids}

@router.post("/mp4/")
async def upload_mp4(mp4_files: List[UploadFile] = File(...)):
    mp4_file_ids = await upload_files(mp4_files, ['video/mp4'], mp4_fs)
    return {"mp4_file_ids": mp4_file_ids}

@router.get("/download_image/{file_id}")
async def download_image(file_id: str):
    try:
        # แปลง file_id จาก string เป็น ObjectId
        object_id = ObjectId(file_id)
        
        # ดึงไฟล์จาก MongoDB GridFS
        grid_out = await image_fs.open_download_stream(object_id)
        
        # ตรวจสอบว่าไฟล์มีอยู่หรือไม่
        if grid_out is None:
            raise HTTPException(status_code=404, detail="File not found")
        
        # เข้ารหัสชื่อไฟล์ใน Content-Disposition header
        filename = quote(grid_out.filename)
        content_disposition = f'attachment; filename*=UTF-8\'\'{filename}'
        
        # ส่งไฟล์กลับไปยังผู้ใช้เป็น StreamingResponse
        return StreamingResponse(
            get_file_stream(object_id), 
            media_type="application/octet-stream",
            headers={"Content-Disposition": content_disposition}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )