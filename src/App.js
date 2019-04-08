import React, { Component } from "react";
import styled from "styled-components";
import { Replayer } from "./replay";
import "./replay/styles/style.css";
import example_events from "./example_recording.json";
console.log(Replayer);
// const { Replayer } = window.require("electron").remote.require("./replay/");

/** /
const { open_file, load_replay } = window.require("electron").remote.require("./play.js");
/*/
const load_replay = () => {};
/**/

const textToArr = res => {
        const match = res.match(/^\s+const events = (\[.*\]);.*$/m);
        if (match) {
                return JSON.parse(match[1]);
        }
        return res.split(/\n/).reduce((arr, row) => {
                try {
                        const e = JSON.parse(row);
                        return [...arr, e];
                } catch (e) {
                        return arr;
                }
        }, []);
};
const make_reader = cb => {
        const FR = new FileReader();
        FR.onload = e => {
                try {
                        cb(JSON.parse(e.target.result));
                } catch (err) {
                        cb(textToArr(e.target.result));
                }
        };
        FR.onerror = e => console.log(e);
        FR.onabort = e => console.log(e);
        return FR;
};

const Controls = styled.div`
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 100px;
`;
const PlayerFrame = styled.div`
        transform: scale(0.85);
`;
const LoadStyled = styled.input`
        font-size: 220px;
`;
const Load = props => <LoadStyled type="file" {...props} />;

class PlayerScreen extends React.Component {
        componentDidUpdate(prevProps) {
                if (!this.props.events) {
                        this.Replayer = null;
                        return null;
                }
                if (!prevProps.events) {
                        console.log("setup events");
                        try {
                                this.Replayer = new Replayer(this.props.events, { root: this.root });
                                this.Replayer.play();
                                this.Replayer.timer.onTimeOffsetChange = this.props.onTimeOffsetChange;
                        } catch (e) {
                                console.error(e);
                        }
                }
                if (prevProps.events && prevProps.play !== this.props.play) {
                        console.log("change play to", this.props.play ? "resume" : "pause");
                        this.Replayer[this.props.play ? "resume" : "pause"]();
                }
        }
        render() {
                return (
                        <div>
                                <PlayerFrame ref={r => (this.root = r)} />
                        </div>
                );
        }
}
const formatDateTime = date => {
        const d = new Date(date);
        return `${d.getDate()}.${d.getMonth()}.${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`;
};
const formatDate = date => {
        const d = new Date(date);
        return `${d.getDate()}.${d.getMonth()}.${d.getFullYear()}`;
};
const formatTime = date => {
        const d = new Date(date);
        return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`;
};
const findEventIndex = (events, time) => {
        const t = events[0].timestamp + time;
        for (let i = 0; i < events.length; ++i) {
                if (events[i].timestamp > t) {
                        return i - 1;
                }
        }
};

class App extends Component {
        state = { events: null, play: false, time: null };
        componentDidMount() {
                this.setState({ events: null, play: false }, () => {
                        this.reader = make_reader(events => this.setState({ events, play: true }));
                });
                this.setState({ events: example_events, play: true });
        }
        render() {
                let time_data = null;
                if (this.state.events) {
                        const date = formatDate(this.state.events[0].timestamp);
                        const start = formatTime(this.state.events[0].timestamp);
                        const end = formatTime(this.state.events[this.state.events.length - 1].timestamp);
                        const eventIndex = findEventIndex(this.state.events, this.state.time);
                        const time = Math.round(this.state.time / 10) / 10;
                        time_data = (
                                <>
                                        Date: <b>{date}</b> Start: <b>{start}</b> End: <b>{end}</b>{" "}
                                        {this.state.time && (
                                                <>
                                                        <b>{this.state.play ? "Playing" : "Paused"}</b> Timestamp:{" "}
                                                        <b>
                                                                {eventIndex > 0 &&
                                                                        this.state.events[eventIndex].timestamp}
                                                        </b>{" "}
                                                        Frame:{" "}
                                                        <b>
                                                                {eventIndex}/{this.state.events.length}
                                                        </b>{" "}
                                                        Time: <b>{time}</b>
                                                </>
                                        )}
                                </>
                        );
                }
                return (
                        <>
                                <PlayerScreen
                                        {...this.state}
                                        onTimeOffsetChange={time => {
                                                this.setState({ time });
                                        }}
                                />
                                <Controls>
                                        <button onClick={() => this.setState({ play: !this.state.play })}>
                                                Play/Pause
                                        </button>
                                        {time_data}
                                        <Load
                                                onChange={e =>
                                                        this.reader.readAsText(
                                                                (console.log(e.target.files), e.target.files[0])
                                                        )
                                                }
                                        />
                                </Controls>
                        </>
                );
        }
}

export default App;
