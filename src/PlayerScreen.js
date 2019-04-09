import React from "react";
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
                                this.Replayer = new Replayer(this.props.events, { root: this.root });
                                this.Replayer.timer.onTimeOffsetChange = this.props.onTimeOffsetChange;
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
        render() {
                const { events, event } = this.props;
                const top =
                        events &&
                        events[event] &&
                        events[event]._windowProps &&
                        events[event]._windowProps.outerHeight - events[event]._windowProps.innerHeight;
                return (
                        <div>
                                <Gaze gaze={this.props.gaze} timepoint={this.props.timepoint} />
                                <PlayerFrame ref={r => (this.root = r)} style={{ top }} />
                        </div>
                );
        }
}

export default PlayerScreen;
