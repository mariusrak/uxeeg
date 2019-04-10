import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { Replayer } from "./replay";
import Gaze from "./Gaze";

const PlayerFrame = styled.div`
        position: absolute;
        .replayer-mouse {
                z-index: 2;
        }
        iframe {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                margin: auto;
                border: none;
        }
`;
const Screen = styled.div`
        position: absolute;
        width: 1920px;
        left: 0;
        right: 0;
        margin: auto;
`;
class PlayerScreen extends React.Component {
        componentDidUpdate(prevProps) {
                if (!this.props.events) {
                        if (this.Replayer) {
                                this.Replayer.destroy();
                        }
                        this.Replayer = null;
                        return null;
                }
                if (!prevProps.events) {
                        console.log("setup events");
                        try {
                                this.Replayer = new Replayer(this.props.events, {
                                        root: this.root,
                                        onPlayResize: this.props.iframeSize
                                });
                                this.props.setIframe(this.Replayer.iframe);
                                this.Replayer.timer.onTimeOffsetChange = this.props.onTimeOffsetChange;
                                this.Replayer.timer.calculateGazes = this.props.calculateGazes;
                                this.Replayer.play();
                        } catch (e) {
                                console.error(e);
                        }
                }
                if (prevProps.events && prevProps.play !== this.props.play) {
                        console.log("change play to", this.props.play ? "resume" : "pause");
                        this.Replayer[this.props.play ? "resume" : "pause"]();
                }
                if (prevProps.setTime !== this.props.setTime && this.Replayer) {
                        this.Replayer.rewind(this.props.setTime);
                }
        }
        eeg_percent = timepoint => {
                if (!this.props.eeg) {
                        return 0.5;
                }
                const points = this.props.eeg.map(d => d.v);
                const min = Math.min(...points);
                const max = Math.max(...points);
                return (points[Math.round(points.length * timepoint)] - min) / (max - min);
        };
        render() {
                const { events, event } = this.props;
                const top =
                        events &&
                        events[event] &&
                        events[event]._windowProps &&
                        events[event]._windowProps.outerHeight - events[event]._windowProps.innerHeight;
                return (
                        <Screen>
                                <Gaze
                                        gaze={this.props.gaze}
                                        timepoint={this.props.timepoint}
                                        offsetTop={top}
                                        eeg_percent={this.eeg_percent}
                                        width={this.props.iframeWidth}
                                        height={this.props.iframeHeight}
                                />
                                <PlayerFrame ref={r => (this.root = r)} />
                        </Screen>
                );
        }
}

export default PlayerScreen;
