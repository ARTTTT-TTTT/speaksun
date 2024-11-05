import { useState, useRef, useEffect } from "react";
import { Typography } from "@material-tailwind/react";

import { uploadAudioFile } from "@/repositories";

export function TestRecordAudio() {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingComplete, setRecordingComplete] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [responseMessage, setResponseMessage] = useState<string | null>(null);
    const [counter, setCounter] = useState(1);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    const resampleAudio = async (audioBlob: Blob, targetSampleRate: number): Promise<Blob> => {
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const offlineContext = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.duration * targetSampleRate, targetSampleRate);
        const bufferSource = offlineContext.createBufferSource();
        bufferSource.buffer = audioBuffer;
        bufferSource.connect(offlineContext.destination);
        bufferSource.start(0);

        const renderedBuffer = await offlineContext.startRendering();
        const resampledBlob = audioBufferToWavBlob(renderedBuffer);
        return resampledBlob;
    };

    const audioBufferToWavBlob = (audioBuffer: AudioBuffer): Blob => {
        const numberOfChannels = audioBuffer.numberOfChannels;
        const length = audioBuffer.length * numberOfChannels * 2 + 44;
        const buffer = new ArrayBuffer(length);
        const view = new DataView(buffer);

        writeString(view, 0, "RIFF");
        view.setUint32(4, 36 + audioBuffer.length * numberOfChannels * 2, true);
        writeString(view, 8, "WAVE");
        writeString(view, 12, "fmt ");
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, audioBuffer.sampleRate, true);
        view.setUint32(28, audioBuffer.sampleRate * numberOfChannels * 2, true);
        view.setUint16(32, numberOfChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, "data");
        view.setUint32(40, audioBuffer.length * numberOfChannels * 2, true);

        let offset = 44;
        for (let i = 0; i < audioBuffer.length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const sample = audioBuffer.getChannelData(channel)[i];
                view.setInt16(offset, sample * 0x7fff, true);
                offset += 2;
            }
        }

        return new Blob([buffer], { type: "audio/wav" });
    };

    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    const startRecording = async () => {
        setIsRecording(true);
        setCounter(1);
        setResponseMessage("");

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.start();

        const timer = setInterval(() => {
            setCounter((prevCounter) => prevCounter + 1);
        }, 1000);

        timeoutRef.current = setTimeout(() => {
            clearInterval(timer);
            stopRecording();
        }, 3000);
    };

    const stopRecording = async () => {
        setIsRecording(false);
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
                const resampledBlob = await resampleAudio(audioBlob, 44100);
                setAudioBlob(resampledBlob);

                audioChunksRef.current = [];
                setRecordingComplete(true);

                if (mediaStreamRef.current) {
                    mediaStreamRef.current.getTracks().forEach((track) => track.stop());
                }
            };
        }
    };

    const handleToggleRecording = () => {
        setRecordingComplete(true);
        setIsRecording(!isRecording);
        if (!isRecording) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            startRecording();
        } else {
            stopRecording();
        }
    };

    const downloadAudio = () => {
        if (audioBlob) {
            const url = URL.createObjectURL(audioBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "recording.wav";
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const uploadAudio = async () => {
        if (audioBlob) {
            const formData = new FormData();
            formData.append("file", audioBlob, "recording.wav");

            try {
                const responseData = await uploadAudioFile(formData);

                if (responseData === 1) {
                    setResponseMessage("พูดไม่ชัด");
                } else if (responseData === 0) {
                    setResponseMessage("พูดชัด");
                }
                console.log(responseData);
            } catch (error) {
                console.error("Error uploading file:", error);
            }
        }
    };

    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    // Render the microphone component with appropriate UI based on recording state
    return (
        <div className="flex justify-center items-center">
            {isRecording ? (
                <div className="my-16 mx-auto rounded-md border p-4 bg-white">
                    <div className="flex-1 flex w-full justify-between">
                        <div className="space-y-1">
                            {recordingComplete && (
                                <div>
                                    <Typography variant="h5" color="blue-gray" className="justify-center flex items-center">
                                        <span className="rounded-full w-4 h-4 bg-red-400 animate-pulse mr-2" />
                                        Recording {counter} s
                                    </Typography>
                                    <Typography variant="lead" className="font-normal text-base !text-gray-500">
                                        Start speaking...
                                    </Typography>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                // Button for starting record
                <div>
                    <button
                        title="Start Recording"
                        onClick={handleToggleRecording}
                        className="m-auto flex items-center justify-center bg-lime-600 hover:bg-lime-700 rounded-full w-32 h-32 focus:outline-none"
                    >
                        <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-white">
                            <path
                                fill="currentColor"
                                d="M128 176a48.05 48.05 0 0 0 48-48V64a48 48 0 0 0-96 0v64a48.05 48.05 0 0 0 48 48ZM96 64a32 32 0 0 1 64 0v64a32 32 0 0 1-64 0Zm40 143.6V232a8 8 0 0 1-16 0v-24.4A80.11 80.11 0 0 1 48 128a8 8 0 0 1 16 0a64 64 0 0 0 128 0a8 8 0 0 1 16 0a80.11 80.11 0 0 1-72 79.6Z"
                            />
                        </svg>
                    </button>
                    <Typography variant="h5" color="blue-gray" className="mt-6 justify-center flex items-center">
                        กดเพื่อบันทึกเสียง
                    </Typography>
                    <Typography variant="lead" className="font-normal text-base !text-gray-500">
                        ระบบจะบันทึกเสียงเป็นเวลา 3 วินาที
                    </Typography>

                    {audioBlob && (
                        <div>
                            {responseMessage && (
                                <div className="flex items-center justify-center mt-4">
                                    <p className="text-xl font-bold">{responseMessage}</p>
                                </div>
                            )}
                            <div className="flex items-center justify-center mt-4 space-x-4">
                                <button
                                    onClick={uploadAudio}
                                    className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none"
                                >
                                    Upload Record
                                </button>
                            </div>
                            <div className="flex items-center justify-center mt-4 space-x-4">
                                <button
                                    onClick={downloadAudio}
                                    className="bg-green-400 hover:bg-green-500 text-white font-bold py-2 px-4 rounded focus:outline-none"
                                >
                                    Download Record
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default TestRecordAudio;
