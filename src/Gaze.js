import React from "react";
import styled from "styled-components";
import { perc2color } from "./utils";

const GazeCanvas = styled.div`
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        z-index: 2;
        svg {
                position: absolute;
        }
`;

const traceLength = 200;
const Gaze = ({ gaze, eeg_percent, timepoint, width, height, offsetTop }) => {
        if (!gaze) {
                return null;
        }
        const points = [];
        const current = Math.round(gaze.length * timepoint);
        for (let i = Math.max(current - traceLength, 0); i < Math.min(current + traceLength, gaze.length - 1); ++i) {
                if (gaze[i].x == -1 || gaze[i].y == -1) {
                        continue;
                }
                points.push(gaze[i]);
        }
        if (!gaze[current]) {
                return null;
        }
        const color = perc2color(eeg_percent(timepoint));
        return (
                <GazeCanvas>
                        <svg viewBox={`0 0 ${width} ${height}`}>
                                {points.slice(0, -1).map((point, i) => (
                                        <>
                                                <path
                                                        strokeWidth="3"
                                                        opacity={color}
                                                        fill="none"
                                                        stroke={color}
                                                        d={`M${point.x},${point.y - offsetTop} L${
                                                                points[i + 1].x
                                                        },${points[i + 1].y - offsetTop}`}
                                                        key={i}
                                                />
                                        </>
                                ))}
                                <circle
                                        cx={gaze[current].x}
                                        cy={gaze[current].y - offsetTop}
                                        r="20"
                                        stroke={color}
                                        strokeWidth="2"
                                        fill={color}
                                        fillOpacity="0.5"
                                />
                        </svg>
                </GazeCanvas>
        );
};
export default Gaze;
