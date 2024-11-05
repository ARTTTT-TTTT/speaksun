interface CircleProgressBarProps {
    progress: number;
    size?: number;
    strokeWidth?: number;
    circleOneStroke?: string;
    circleTwoStroke?: string;
    textBackground?: string;
    textColor?: string;
}

export const CircleProgressBar: React.FC<CircleProgressBarProps> = ({
    progress,
    size = 120,
    strokeWidth = 10,
    circleOneStroke = "#d9edfe",
    circleTwoStroke = "#4A90E2",
    textBackground = "#4A90E2",
    textColor = "#FFFFFF",
}) => {
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg width={size} height={size} className="mx-auto">
            <circle cx={center} cy={center} r={radius} stroke={circleOneStroke} strokeWidth={strokeWidth} fill="none" />
            <circle
                cx={center}
                cy={center}
                r={radius}
                stroke={circleTwoStroke}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-300"
            />
            <circle cx={center} cy={center} r={radius / 1.3} fill={textBackground} />
            <text x={center} y={center} dy="0.3em" textAnchor="middle" fill={textColor} className=" text-3xl font-bold font-itim">
                {progress}%
            </text>
        </svg>
    );
};

export default CircleProgressBar;
