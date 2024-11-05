import { useRouter } from "next/router";

import { PreRecordAudio, TestRecordAudio, ProtectedRoute } from "@/components";

export default function TestPage() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <article className="relative w-full h-full">
            <main className="container mx-auto px-4 py-8">
                <section className="bg-white rounded-lg shadow-md p-6">
                    {id === "1" ? (
                        <>
                            <h2 className="text-xl font-semibold mb-4">
                                {id === "1" ? "Low Sampling Rate (only Dev macOS)" : "Test with Download (44.1kHz)"}
                            </h2>
                            <PreRecordAudio />
                        </>
                    ) : (
                        <>
                            <h2 className="text-xl font-semibold mb-4">
                                {id === "1" ? "Low Sampling Rate (only Dev macOS)" : "Test with Download (44.1kHz)"}
                            </h2>
                            <TestRecordAudio />
                        </>
                    )}
                </section>
            </main>
        </article>
    );
}
