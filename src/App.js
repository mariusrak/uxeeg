import React, { Component } from "react";
import styled, { createGlobalStyle } from "styled-components";
import EEG from "./EEG";
import AOIs from "./AOIs";
import PlayerScreen from "./PlayerScreen";
import "./replay/styles/style.css";
import TimeLine from "./TimeLine";
import { formatMachineDateTime, perc2color } from "./utils";
import Metadata from "./Metadata";

const GlobalStyle = createGlobalStyle`
        html,
        body {
                height: 100%;
                margin: 0;
                background: ${p => p.color}
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
const Overlay = styled.div`
        position: absolute;
        z-index: 1;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
`;
const Controls = styled.div`
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 3;
        background: rgba(255, 255, 255, 0.4);
`;
const TimeLineStyled = styled(TimeLine)`
        position: absolute;
        bottom: 50px;
        left: 0;
        right: 0;
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
const parse_eeg = (txt, cb) => {
        eeg_data = txt
                .split(/[\r\n]+/gm)
                .slice(1)
                .map(line => {
                        const cols = line.split(/\s+/).slice(1, 3);
                        // return [parseFloat(cols[0]), parseFloat(cols[1])];
                        return { t: parseFloat(cols[0]), v: parseFloat(cols[1]) };
                });
        cb();
};
const parse_aois = (txt, cb) => {
        const aois = txt.match(/(%%.*[\n\r]+.*[\n\r]*)/g).reduce((aois, m) => {
                const split = m.split(/[\r\n]+/);
                const label = split[0].replace(/^%%/, "").trim();
                const xpath = split[1].trim();
                aois[xpath] = { label, ranges: [] };
                return aois;
        }, {});
        cb(aois);
};

class App extends Component {
        state = { events: null, gaze: null, eeg: null, play: false, time: null, dropping: false, speed: 2 };
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
                const start = this.state.events[0].timestamp;
                const end = this.state.events[this.state.events.length - 1].timestamp;
                const eeg = eeg_data.filter(v => v.t && (v.t > start && v.t < end));
                // const eeg = eeg_data.filter(v => v[0] && (v[0] > start && v[0] < end));
                this.setState({ eeg });
        };
        componentDidUpdate() {
                if (!this.state.events && this.state.play) {
                        this.setState({ play: false });
                }
        }
        iframeSize = dimension => {
                this.setState({ iframeWidth: dimension.width, iframeHeight: dimension.height });
        };
        componentDidMount() {
                this.reader_events = make_reader(
                        file => this.setState({ file_web: file.name, events: null }),
                        parse_events,
                        events => this.setState({ events }, () => this.cutData(() => ({ play: true })))
                );
                this.reader_eyetracker = make_reader(
                        file => this.setState({ file_gaze: file.name, gaze: null }),
                        parse_eyetracker,
                        () => this.cutData(() => ({ play: !!this.state.events }))
                );
                this.reader_eeg = make_reader(
                        file => this.setState({ file_eeg: file.name, eeg: null }),
                        parse_eeg,
                        () => this.cutData(() => ({ play: !!this.state.events }))
                );
                this.reader_aois = make_reader(
                        file => this.setState({ file_aois: file.name, aois: null }),
                        parse_aois,
                        aois => this.setState({ aois })
                );
                document.addEventListener("dragover", e => e.preventDefault(), false);
                document.addEventListener(
                        "drop",
                        e => {
                                e.preventDefault();
                                Array.from(e.dataTransfer.files).forEach(file => {
                                        const ext = file.name.match(/\.(\w+)$/)[1];
                                        if (file.name === "AOIs.txt") {
                                                this.reader_aois(file);
                                        } else if (ext === "txt") {
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
                const timepoint = this.state.time / total_time;
                const event = this.findEventIndex(this.state.time);
                const offsetTop =
                        this.state.events &&
                        this.state.events[event] &&
                        this.state.events[event]._windowProps &&
                        this.state.events[event]._windowProps.outerHeight -
                                this.state.events[event]._windowProps.innerHeight;
                return (
                        <>
                                <Overlay />
                                <PlayerScreen
                                        makeSmaller={document.body.clientWidth < 2250}
                                        {...this.state}
                                        setIframe={iframe => this.setState({ iframe })}
                                        event={event}
                                        timepoint={timepoint}
                                        onTimeOffsetChange={time => {
                                                this.setState({ time });
                                        }}
                                        calculateGazes={(start, end) => this.AOIs.calculateGazes(start, end)}
                                        offsetTop={offsetTop}
                                        iframeSize={this.iframeSize}
                                />
                                <AOIs
                                        ref={a => (this.AOIs = a)}
                                        AOIs={this.state.aois}
                                        iframe={this.state.iframe}
                                        gaze={this.state.gaze}
                                        eeg={this.state.eeg}
                                        offsetTop={offsetTop}
                                        timepoint={timepoint}
                                />
                                <Controls>
                                        <TimeLineStyled
                                                total={total_time}
                                                current={this.state.time}
                                                onChange={t => this.setState({ setTime: t })}
                                        >
                                                {this.state.eeg && <EEG data={this.state.eeg} />}
                                        </TimeLineStyled>
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
                                        </button>
                                        {[1, 2, 3, 4].map(n => (
                                                <button onClick={() => this.setState({ speed: n })}>
                                                        {this.state.speed === n ? <b>--&gt; {n} &lt;--</b> : n}
                                                </button>
                                        ))}
                                        <Metadata {...this.state} event={event} />
                                </Controls>
                                {!this.state.events && <DropZone />}
                                <GlobalStyle />
                        </>
                );
        }
}

export default App;
