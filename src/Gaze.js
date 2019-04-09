import React from "react";
import styled from "styled-components";

const GazeCanvas = styled.div`
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        z-index: 2;
`;
const GazePoint = styled.div`
        position: absolute;
        &:before {
                content: "";
                display: block;
                width: 20px;
                height: 20px;
                margin: -10px 0 0 -10px;
                border: 2px solid orange;
                background: rgba(255, 237, 98, 0.31);
                border-radius: 50%;
        }
`;

class Gaze extends React.Component {
        render() {
                if (!this.props.gaze) {
                        return null;
                }
                const points = [];
                const current = Math.round(this.props.gaze.length * this.props.timepoint);
                for (let i = Math.max(current - 10, 0); i < Math.min(current + 10, this.props.gaze.length - 1); ++i) {
                        points.push(this.props.gaze[i]);
                }
                // const point = this.props.gaze[Math.round(this.props.gaze.length * this.props.timepoint)];
                return (
                        <GazeCanvas>
                                {/* {point && <GazePoint style={{ top: point.y + "px", left: point.x + "px" }} />} */}
                                {points.map((point, i) => (
                                        <GazePoint key={i} style={{ top: point.y + "px", left: point.x + "px" }} />
                                ))}
                        </GazeCanvas>
                );
        }
}
export default Gaze;
