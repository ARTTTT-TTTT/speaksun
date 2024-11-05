import { ProgressionPercentModel } from "../models/progressionModel";

const API_URL = process.env.NEXT_PUBLIC_FASTAPI_URL;

export const getProgressionsPercent = async (token: string): Promise<ProgressionPercentModel[]> => {
    const response = await fetch(`${API_URL}/progressions/percent`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    const data: ProgressionPercentModel[] = await response.json();
    return data;
};

export const getExerciseIdPercent = async (token: string, exercise_id: string): Promise<ProgressionPercentModel> => {
    const response = await fetch(`${API_URL}/progressions/${exercise_id}/percent`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    const percentData = await response.json();
    return percentData;
};
