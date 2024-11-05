import { Button, Typography } from "@material-tailwind/react";
import Image from "next/image";
import Link from "next/link";

import { CircleProgressBar } from "@/components";
import { ProgressionPercentModel } from "../models/progressionModel";

export function ExerciseCard({ exercise_id, percent }: ProgressionPercentModel) {
    return (
        <Link href={`/exercises/${exercise_id}`}>
            <Button
                fullWidth
                className="bg-deep-purple-100 text-black p-0 sm:h-[10rem] sm:w-[20rem] h-[8rem] w-[18rem] flex justify-center items-center rounded-xl"
            >
                <article className="flex justify-center items-center h-full w-full">
                    <section className="flex flex-col justify-start items-start h-full w-full text-center -mb-7">
                        <Typography
                            variant="h4"
                            className="h-[30%] w-full -mb-3 !leading-tight text-nowrap text-center lg:text-[1.77rem] md:text-[1.62rem] sm:text-2xl text-[1.4rem]"
                        >
                            Exercise {exercise_id}
                        </Typography>
                        <div className="flex items-center pl-0 h-[70%]">
                            <Image
                                width={912}
                                height={797}
                                alt=""
                                src="/image/decoration1.png"
                                className="w-[90%] h-[80%]"
                                priority // เพิ่ม priority ที่นี่
                            />
                        </div>
                    </section>
                    <section className="flex justify-center items-center h-[30%] w-full">
                        <CircleProgressBar progress={percent} size={120} strokeWidth={10} />
                    </section>
                </article>
            </Button>
        </Link>
    );
}

export default ExerciseCard;
