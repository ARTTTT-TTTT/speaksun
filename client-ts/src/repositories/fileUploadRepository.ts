const API_URL = process.env.NEXT_PUBLIC_FASTAPI_URL;

export const uploadAudioFile = async (formData: FormData): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/files/wav_prediction/`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to upload file.");
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};