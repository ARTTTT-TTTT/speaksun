import { useState, useRef, useEffect } from "react";

import { uploadAudioFile } from "@/repositories";

// Export the MicrophoneComponent function component
export function PreRecordAudio() {
    // State variables to manage recording status, completion, audio blob, and server response message
    const [isRecording, setIsRecording] = useState(false);
    const [recordingComplete, setRecordingComplete] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [responseMessage, setResponseMessage] = useState<string | null>(null);

    // Reference to store the MediaRecorder instance
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Function to start recording
    const startRecording = async () => {
        setIsRecording(true);

        // Request microphone access and start the MediaRecorder
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });
        mediaRecorderRef.current = new MediaRecorder(stream);

        // Handle the data available event to collect audio chunks
        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        // Start recording audio
        mediaRecorderRef.current.start();
    };

    // Cleanup effect when the component unmounts
    useEffect(() => {
        return () => {
            // Stop the MediaRecorder if it's active
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    // Function to stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            // Stop the MediaRecorder and create a Blob from the collected audio chunks
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: "audio/wav",
                });
                setAudioBlob(audioBlob);
                audioChunksRef.current = [];
                setRecordingComplete(true);
            };
        }
    };

    // Toggle recording state and manage recording actions
    const handleToggleRecording = () => {
        setIsRecording(!isRecording);
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    };

    // Function to download the recorded audio
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

    // Function to upload the recorded audio to the server
    const uploadAudio = async () => {
        if (audioBlob) {
            const formData = new FormData();
            formData.append("file", audioBlob, "recording.wav");

            try {
                const responseData = await uploadAudioFile(formData);

                // Update the response message based on the response data
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

    // Render the microphone component with appropriate UI based on recording state
    return (
        <div className="flex items-center justify-center h-screen w-full">
            <div className="w-full">
                {isRecording && (
                    <div className="w-1/4 m-auto rounded-md border p-4 bg-white">
                        <div className="flex-1 flex w-full justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">{recordingComplete ? "Recorded" : "Recording"}</p>
                                <p className="text-sm text-muted-foreground">{recordingComplete ? "Thanks for talking." : "Start speaking..."}</p>
                            </div>
                            {isRecording && <div className="rounded-full w-4 h-4 bg-red-400 animate-pulse" />}
                        </div>
                    </div>
                )}

                <div className="flex items-center w-full">
                    {isRecording ? (
                        // Button for stopping recording
                        <button
                            title="Stop Recording"
                            onClick={handleToggleRecording}
                            className="mt-10 m-auto flex items-center justify-center bg-red-400 hover:bg-red-500 rounded-full w-20 h-20 focus:outline-none"
                        >
                            <svg className="h-12 w-12 " viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path fill="white" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                            </svg>
                        </button>
                    ) : (
                        // Button for starting recording
                        <button
                            title="Start Recording"
                            onClick={handleToggleRecording}
                            className="mt-10 m-auto flex items-center justify-center bg-blue-400 hover:bg-blue-500 rounded-full w-20 h-20 focus:outline-none"
                        >
                            <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white">
                                <path
                                    fill="currentColor" // Change fill color to the desired color
                                    d="M128 176a48.05 48.05 0 0 0 48-48V64a48 48 0 0 0-96 0v64a48.05 48.05 0 0 0 48 48ZM96 64a32 32 0 0 1 64 0v64a32 32 0 0 1-64 0Zm40 143.6V232a8 8 0 0 1-16 0v-24.4A80.11 80.11 0 0 1 48 128a8 8 0 0 1 16 0a64 64 0 0 0 128 0a8 8 0 0 1 16 0a80.11 80.11 0 0 1-72 79.6Z"
                                />
                            </svg>
                        </button>
                    )}
                </div>

                {audioBlob && (
                    <div>
                        <div className="flex items-center justify-center mt-4 space-x-4">
                            <button
                                onClick={downloadAudio}
                                className="bg-green-400 hover:bg-green-500 text-white font-bold py-2 px-4 rounded focus:outline-none"
                            >
                                Download Recording
                            </button>
                        </div>
                        <div className="flex items-center justify-center mt-4 space-x-4">
                            <button
                                onClick={uploadAudio}
                                className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none"
                            >
                                Upload Recording
                            </button>
                        </div>
                    </div>
                )}

                {responseMessage && (
                    <div className="flex items-center justify-center mt-4">
                        <p className="text-xl font-bold">{responseMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PreRecordAudio;
