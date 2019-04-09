import React, { Component } from "react";
import styled, { createGlobalStyle } from "styled-components";
import EEG from "./EEG";
import PlayerScreen from "./PlayerScreen";
import "./replay/styles/style.css";
import TimeLine from "./TimeLine";
import { formatMachineDateTime } from "./utils";
import Metadata from "./Metadata";

const GlobalStyle = createGlobalStyle`
        html,
        body {
                height: 100%;
        }
`;
const DropZone = styled.div`
        position: fixed;
        z-index: 999;
        top: 0;
        bottom: 80px;
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
const Controls = styled.div`
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 80px;
        z-index: 3;
`;

const make_reader = (before, parser, after) => {
        const FR = new FileReader();
        FR.onload = e => parser(e.target.result, after);
        FR.onerror = e => console.log(e);
        FR.onabort = e => console.log(e);
        return data => {
                before(data);
                FR.readAsText(data);
        };
};
let eye_tracker_data;
let eeg_data;
const parse_events = (txt, cb) => {
        const data = txt.replace(/http/g, "http://" + window.location.hostname + ":4000/pipe/http");
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
                        return { time: parseInt((cols[11] || "").replace("_", ""), 10), x: cols[28], y: cols[29] }; // Timestamp, GazeX, GazeY
                        //return { time: cols[11], x: cols[28], y: cols[29], fx: cols[39], fy, cols[40], mx:cols[47], my: cols[48] }; // Timestamp, GazeX, GazeY, FixationX, FixationY, (mouse?)X, (mouse?)Y
                });
        cb();
};
const parse_eeg = (txt, cb) => {};

class App extends Component {
        state = { events: null, gaze: null, eeg: null, play: false, time: null, dropping: false };
        cutData = newStateFn => {
                this.cutGaze();
                this.cutEEG();
                this.setState(newStateFn());
        };
        cutGaze = () => {
                if (!this.state.events || !eye_tracker_data) {
                        return;
                }
                const start = formatMachineDateTime(this.state.events[0].timestamp);
                const end = formatMachineDateTime(this.state.events[this.state.events.length - 1].timestamp);
                const gaze = eye_tracker_data.filter(e => e.time && (e.time > start && e.time < end));
                this.setState({ gaze });
        };
        cutEEG = () => {
                if (!this.state.events || !eeg_data) {
                        return;
                }
                // const start = formatMachineDateTime(this.state.events[0].timestamp);
                // const end = formatMachineDateTime(this.state.events[this.state.events.length - 1].timestamp);
                // const gaze = eye_tracker_data.filter(e => e.time && (e.time > start && e.time < end));
                // this.setState({ gaze });
        };
        componentDidUpdate() {
                if (!this.state.events && this.state.play) {
                        this.setState({ play: false });
                }
        }
        componentDidMount() {
                this.reader_events = make_reader(
                        file => this.setState({ file_web: file.name, events: null }),
                        parse_events,
                        events => this.setState({ events }, () => this.cutData(() => ({ play: true })))
                );
                this.reader_eyetracker = make_reader(
                        file => this.setState({ file_gaze: file.name, gaze: null }),
                        parse_eyetracker,
                        gaze => this.setState({ gaze }, () => this.cutData(() => ({ play: !!this.state.events })))
                );
                this.reader_eeg = make_reader(
                        file => this.setState({ file_eeg: file.name, eeg: null }),
                        parse_eeg,
                        eeg => this.setState({ eeg }, () => this.cutData(() => ({ play: !!this.state.events })))
                );
                document.addEventListener("dragover", e => e.preventDefault(), false);
                document.addEventListener(
                        "drop",
                        e => {
                                e.preventDefault();
                                Array.from(e.dataTransfer.files).forEach(file => {
                                        const ext = file.name.match(/\.(\w+)$/)[1];
                                        if (ext === "txt") {
                                                this.reader_eyetracker(file);
                                        } else if (["json", "html", "rec"].includes(ext)) {
                                                this.reader_events(file);
                                        } else if (ext === "csv") {
                                                this.reader_eeg(file);
                                        }
                                });
                        },
                        false
                );
        }
        findEventIndex = time => {
                if (!this.state.events) {
                        return 0;
                }
                const t = this.state.events[0].timestamp + time;
                for (let i = 0; i < this.state.events.length; ++i) {
                        if (this.state.events[i].timestamp > t) {
                                return i - 1;
                        }
                }
        };
        render() {
                const total_time =
                        this.state.events &&
                        this.state.events[this.state.events.length - 1].timestamp - this.state.events[0].timestamp;
                const event = this.findEventIndex(this.state.time);
                return (
                        <>
                                <PlayerScreen
                                        {...this.state}
                                        event={event}
                                        timepoint={this.state.time / total_time}
                                        onTimeOffsetChange={time => {
                                                this.setState({ time });
                                        }}
                                />
                                {/* <EEG /> */}
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
                                        <Metadata {...this.state} event={event} />
                                        <TimeLine
                                                total={total_time}
                                                current={this.state.time}
                                                onChange={t => this.setState({ setTime: t })}
                                        />
                                </Controls>
                                {!this.state.events && <DropZone />}
                                <GlobalStyle />
                        </>
                );
        }
}

export default App;
