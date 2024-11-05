import { Typography } from "@material-tailwind/react";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import nookies from "nookies";
import { useQuery } from "react-query";

import { ExerciseCard, Navbar, Footer, ProtectedRoute } from "@/components";
import { getUserProfile, getProgressionsPercent, getExerciseIds } from "@/repositories";
import { ProgressionPercentModel, ReadUserProfileModel, ExerciseIdModel } from "@/models";

const API_URL = process.env.NEXT_PUBLIC_FASTAPI_URL;

export default function HomePage() {
    const imageUrl = `${API_URL}/exercises/images/669aa9f48b2a24677129a079`;
    const [exercisesWithPercent, setExercisesWithPercent] = useState<ProgressionPercentModel[]>([]);
    const [profile, setProfile] = useState<ReadUserProfileModel | null>(null);

    const fetchExerciseData = useCallback(async () => {
        const cookies = nookies.get();
        const token = cookies.token;

        const exerciseIds: ExerciseIdModel[] = await getExerciseIds();
        let percentData: ProgressionPercentModel[];

        try {
            percentData = await getProgressionsPercent(token);
        } catch (err) {
            percentData = exerciseIds.map((exercise) => ({ exercise_id: exercise.exercise_id, percent: 0 }));
        }

        return exerciseIds.map((exercise) => ({
            ...exercise,
            percent: (percentData.find((prog) => prog.exercise_id === exercise.exercise_id) || { percent: 0 }).percent,
        }));
    }, []);

    const { data: exercises } = useQuery("exercises", fetchExerciseData);
    const { data: userProfile } = useQuery("userProfile", async () => {
        const cookies = nookies.get();
        const token = cookies.token;
        return await getUserProfile(token);
    });

    useEffect(() => {
        if (exercises) {
            setExercisesWithPercent(exercises);
        }
        if (userProfile) {
            setProfile(userProfile);
        }
    }, [exercises, userProfile]);

    return (
        <ProtectedRoute>
            <article className="relative z-10 w-full h-full">
                <Navbar />
                <div className="flex justify-center items-center">
                    <article className="bg-white my-10 mx-3 pb-12 lg:px-28 md:px-48 sm:px-32 px-10 rounded-xl">
                        <section className="flex flex-col items-center text-center">
                            <figure className="bg-lime-100 flex justify-center items-center my-8 sm:w-[20rem] h-[5rem] w-[18rem] rounded-xl">
                                <div className="flex justify-center items-center h-fit w-[38%]">
                                    <Image
                                        width={1024}
                                        height={1024}
                                        alt="Profile Picture"
                                        src={imageUrl}
                                        className="h-16 w-fit rounded-full object-fill"
                                        priority
                                    />
                                </div>
                                <div className="flex flex-col justify-center items-center h-full w-[62%]">
                                    <Typography variant="h4" className="text-black h-full w-full pt-3 !leading-tight text-nowrap text-center">
                                        {profile?.username || ""}
                                    </Typography>
                                    <Typography variant="lead" className="text-black h-full w-full !leading-tight text-nowrap text-center">
                                        Age: {profile?.age || ""}
                                    </Typography>
                                </div>
                            </figure>
                        </section>
                        <section className="container mx-auto grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-2">
                            {exercisesWithPercent.map((props, idx) => (
                                <ExerciseCard key={idx} {...props} />
                            ))}
                        </section>
                    </article>
                </div>
            </article>
        </ProtectedRoute>
    );
}
