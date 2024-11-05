import { ExerciseIdModel, AlphabetModel } from "@/models";

const API_URL = process.env.NEXT_PUBLIC_FASTAPI_URL;

export const getExerciseIds = async (): Promise<ExerciseIdModel[]> => {
    const response = await fetch(`${API_URL}/exercises/exercise_ids/cursor`);
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    const data: ExerciseIdModel[] = await response.json();
    return data;
};

export const getExerciseById = async (token: string, exercise_id: string) => {
    const res = await fetch(`${API_URL}/exercises/${exercise_id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
    if (!res.ok) {
        throw new Error("Failed to fetch exercise");
    }
    return await res.json();
};

export async function getAlphabet(exercise_id: number, alphabet: string): Promise<AlphabetModel> {
    try {
        const response = await fetch(`${API_URL}/exercises/${exercise_id}/cursor/${encodeURIComponent(alphabet)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result: AlphabetModel = await response.json();
        return result;
    } catch (error) {
        console.error("Error fetching alphabet data:", error);
        // Return default value in case of error
        return {
            alphabet: "",
            image_file: "",
            mp3_file: "",
        };
    }
}
