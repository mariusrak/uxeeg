import React, { Component } from "react";
import ReactDOM from "react-dom";
import styled, { createGlobalStyle } from "styled-components";
import { Replayer } from "./replay";
import "./replay/styles/style.css";
import example_events from "./example_recording.json";
//console.log(Replayer);
// const { Replayer } = window.require("electron").remote.require("./replay/");

/** /
const { open_file, load_replay } = window.require("electron").remote.require("./play.js");
/* /
const load_replay = () => {};
/**/

const GlobalStyle = createGlobalStyle`
        html,
        body {
                height: 100%;
        }
`;

const Controls = styled.div`
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 50px;
`;
const PlayerFrame = styled.div`
        // transform: scale(0.85);
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
const LoadStyled = styled.input`
        font-size: 220px;
`;
const TimeLineStyled = styled.div`
        width: 100%;
        margin: 5px 0;
        cursor: col-resize;
        border: solid #777;
        border-width: 1px 0;
`;
const TimeLinePrgress = styled.div`
        background: #777;
        height: 10px;
`;
const formatDateTime = date => {
        const d = new Date(date);
        return `${d.getDate()}.${d.getMonth()}.${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`;
};
const formatMachineDateTime = date => {
        const d = new Date(date);
        return parseInt(
                d.getFullYear() +
                        (d.getMonth() + 1) +
                        d.getDate() +
                        d.getHours() +
                        d.getMinutes() +
                        d.getSeconds() +
                        d.getMilliseconds(),
                10
        );
};
const formatDate = date => {
        const d = new Date(date);
        return `${d.getDate()}.${d.getMonth()}.${d.getFullYear()}`;
};
const formatTime = date => {
        const d = new Date(date);
        return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`;
};

const Load = props => <LoadStyled type="file" {...props} />;

let eye_tracker_data;
const parse_events = (txt, cb) => {
        const data = txt.replace(/http/g, "http://localhost:4000/pipe/http");
        try {
                cb(JSON.parse(data));
        } catch (err) {
                const match = data.match(/^\s+const events = (\[.*\]);.*$/m);
                if (match) {
                        return cb(JSON.parse(match[1]));
                }
                const ret = data.split(/\n/).reduce((arr, row) => {
                        try {
                                const e = JSON.parse(row);
                                return [...arr, e];
                        } catch (e) {
                                return arr;
                        }
                }, []);
                cb(ret);
        }
};
const parse_eyetracker = (txt, cb) => {
        eye_tracker_data = txt
                .replace(/(^(#|StudyName).*[\n\r]+)/gm, "")
                .split(/[\r\n]+/gm)
                .map(line => {
                        const cols = line.split(/[\t|\s]+/);
                        return { time: parseInt((cols[10] || "").replace("_", "", 10)), x: cols[27], y: cols[28] }; // Timestamp, GazeX, GazeY
                        //return { time: cols[10], x: cols[27], y: cols[28], fx: cols[38], fy, cols[39], mx:cols[46], my: cols[47] }; // Timestamp, GazeX, GazeY, FixationX, FixationY, (mouse?)X, (mouse?)Y
                });
        cb(eye_tracker_data);
        console.log("eye tracker data read finished");
};
const make_reader = (parser, cb) => {
        const FR = new FileReader();
        FR.onload = e => parser(e.target.result, cb);
        FR.onerror = e => console.log(e);
        FR.onabort = e => console.log(e);
        return data => FR.readAsText(data);
};

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
                return (
                        <div>
                                <PlayerFrame ref={r => (this.root = r)} />
                        </div>
                );
        }
}

const TimeLine = ({ total, current, onChange }) => {
        let ref;
        return (
                <TimeLineStyled
                        onClick={e => {
                                const rect = ReactDOM.findDOMNode(ref).getBoundingClientRect();
                                onChange(Math.round(((e.pageX - rect.x) / rect.width) * total));
                        }}
                        ref={r => (ref = r)}
                >
                        <TimeLinePrgress style={{ width: (current / total) * 100 + "%" }} />
                </TimeLineStyled>
        );
};

const DropZone = styled.div`
        position: fixed;
        z-index: 999;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.7);
        &:before,
        &:after {
                content: "Drop Here!";
                z-index: 999;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                display: block;
                width: 300px;
                text-align: center;
                font-size: 30px;
                position: absolute;
                margin: auto;
                font-family: sans-serif;
                height: 30px;
                color: #333;
        }
        &:after {
                content: "";
                width: calc(100% - 30px);
                height: calc(100% - 30px);
                border-radius: 15px;
                border: 5px dashed;
        }
`;

class App extends Component {
        state = { events: null, eyetracker: null, play: false, time: null, dropping: false };
        setEyetracker = () => {
                if (!this.state.events || !eye_tracker_data) {
                        return;
                }
                const start = formatMachineDateTime(this.state.events[0].timestamp);
                const end = formatMachineDateTime(this.state.events[this.state.events.length - 1].timestamp);
                const eyetracker = eye_tracker_data.filter(e => e.time && (e.time > start || e.time < end));
                this.setState({ eyetracker }, () => console.log(this.state.eyetracker));
        };
        componentDidMount() {
                this.reader_events = make_reader(parse_events, events =>
                        this.setState({ events: null, play: false }, () => {
                                this.setState({ events, play: true }, () => this.setEyetracker());
                        })
                );
                this.reader_eyetracker = make_reader(parse_eyetracker, () =>
                        this.setState({ eyetracker: null, play: false }, () => {
                                this.setEyetracker();
                        })
                );
                document.addEventListener("dragover", e => e.preventDefault(), false);
                document.addEventListener(
                        "drop",
                        e => {
                                e.preventDefault();
                                const file = e.dataTransfer.files[0];
                                const ext = file.name.match(/\.(\w+)$/)[1];
                                if (ext === "txt") {
                                        this.reader_eyetracker(file);
                                } else if (["json", "html", "rec"].includes(ext)) {
                                        this.reader_events(file);
                                }
                        },
                        false
                );
        }
        findEventIndex = time => {
                const t = this.state.events[0].timestamp + time;
                for (let i = 0; i < this.state.events.length; ++i) {
                        if (this.state.events[i].timestamp > t) {
                                return i - 1;
                        }
                }
        };
        render() {
                let time_data = null;
                if (this.state.events) {
                        const date = formatDate(this.state.events[0].timestamp);
                        const start = formatTime(this.state.events[0].timestamp);
                        const end = formatTime(this.state.events[this.state.events.length - 1].timestamp);
                        const eventIndex = this.findEventIndex(this.state.time);
                        const _totalTime = Math.round(
                                (this.state.events[this.state.events.length - 1].timestamp -
                                        this.state.events[0].timestamp) /
                                        1000
                        );
                        const totalTime =
                                Math.round(_totalTime / 60) +
                                (_totalTime % 60 < 10 ? ":0" : ":") +
                                Math.round(_totalTime % 60);
                        const rTime =
                                Math.round(this.state.time / 60000) +
                                ":" +
                                ((this.state.time / 1000) % 60 < 10 ? "0" : "") +
                                (Math.round(this.state.time / 1000) % 60);
                        const aTime = formatDateTime(this.state.events[0].timestamp + this.state.time);
                        time_data = (
                                <>
                                        Date: <b>{date}</b> Start: <b>{start}</b> End: <b>{end}</b>{" "}
                                        {this.state.time && (
                                                <>
                                                        Timestamp:{" "}
                                                        <b>
                                                                {eventIndex > 0 &&
                                                                        this.state.events[eventIndex].timestamp}
                                                        </b>{" "}
                                                        Frame:{" "}
                                                        <b>
                                                                {eventIndex}/{this.state.events.length}
                                                        </b>{" "}
                                                        Relative time:{" "}
                                                        <b>
                                                                {rTime}/{totalTime}
                                                        </b>{" "}
                                                        Absolute time: <b>{aTime}</b>
                                                </>
                                        )}
                                </>
                        );
                }
                const total_time =
                        this.state.events &&
                        this.state.events[this.state.events.length - 1].timestamp - this.state.events[0].timestamp;
                return (
                        <>
                                <PlayerScreen
                                        {...this.state}
                                        onTimeOffsetChange={time => {
                                                this.setState({ time });
                                        }}
                                />
                                {this.state.events ? (
                                        <Controls>
                                                <button onClick={() => this.setState({ play: !this.state.play })}>
                                                        {this.state.play ? (
                                                                <>
                                                                        Playing, <b>Pause ||</b>
                                                                </>
                                                        ) : (
                                                                <>
                                                                        Paused, <b>Play ></b>
                                                                </>
                                                        )}
                                                </button>{" "}
                                                {time_data}
                                                <TimeLine
                                                        total={total_time}
                                                        current={this.state.time}
                                                        onChange={t => this.setState({ setTime: t })}
                                                        // onChange={t => alert(this.findEventIndex(t))}
                                                />
                                                {/* <Load onChange={e => this.reader.readAsText(e.target.files[0])} /> */}
                                        </Controls>
                                ) : (
                                        <DropZone />
                                )}
                                <GlobalStyle />
                        </>
                );
        }
}

export default App;
