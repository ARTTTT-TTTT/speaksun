import { Button, Typography } from "@material-tailwind/react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

import { AlphabetModel } from "@/models";

const API_URL = process.env.NEXT_PUBLIC_FASTAPI_URL;

export function AlphabetCard({ alphabet, image_file }: AlphabetModel) {
    const router = useRouter();
    const { id } = router.query;

    const imageUrl = image_file ? `${API_URL}/exercises/images/${image_file}` : `${API_URL}/exercises/images/669fd886a9ab1e377b281896`;
    return (
        <Link href={`/exercises/${id}/${alphabet}`} rel="noopener noreferrer">
            <Button fullWidth className="bg-deep-purple-100 text-black sm:h-[10rem] sm:w-[20rem] h-[8rem] w-[18rem] relative rounded-xl">
                <section className="absolute top-0 left-0 w-[53%]">
                    <figure className="m-1 flex items-center justify-center">
                        <Image
                            src={imageUrl}
                            alt="alphabet"
                            width={768}
                            height={768}
                            className="h-full w-full sm:-mt-0 -mt-2 rounded-xl object-cover"
                            priority
                        />
                    </figure>
                </section>
                <section className="bg-deep-purple-200 absolute top-0 right-0 h-full w-[47%] rounded-xl">
                    <figure className="bg-lime-100 absolute top-0 right-0 h-full w-[88%] rounded-xl">
                        <div className="flex justify-center items-center h-full">
                            <Typography variant="h1" className="flex !leading-tight lg:text-4xl text-3xl text-nowrap text-center">
                                {alphabet}
                            </Typography>
                        </div>
                    </figure>
                </section>
            </Button>
        </Link>
    );
}

export default AlphabetCard;
