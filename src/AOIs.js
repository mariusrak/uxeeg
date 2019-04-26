import React from "react";
import styled from "styled-components";
import { formatMachineDateTime, readIMotionsDate } from "./utils";

const AOIsContainer = styled.div`
        position: absolute;
        right: 0;
        top: 0;

        .label {
                font-weight: 600;
                margin-top: 10px;
        }
        .path {
                font-family: monospace;
        }
        button {
                margin-top: 15px;
        }
`;

const hasParent = (_elm, parent) => {
        let elm = _elm;
        while (true) {
                if (!elm || !elm.matches) {
                        return false;
                }
                if (elm.matches(parent)) {
                        return true;
                }
                elm = elm.parentNode;
        }
};
export default class AOIs extends React.Component {
        state = { AOIs: {}, lastGazeI: 0, lastEegI: 0, lastGazeAOI: null };
        componentDidUpdate(prevProps, prevState) {
                if (!prevProps.AOIs && this.props.AOIs) {
                        this.setState({ AOIs: this.props.AOIs });
                }
                if (this.props.timepoint >= 1 && prevProps.timepoint < 1) {
                        this.closeRanges();
                }
                if (!this.props.gaze) {
                        return;
                }
                if (!prevProps.gaze || prevProps.gaze[0].time !== this.props.gaze[0].time) {
                        this.setState({ beginning: readIMotionsDate(this.props.gaze[0].time) });
                }
        }
        closeRanges = () => {
                const end = this.props.gaze[this.props.gaze.length - 1].time;
                Object.keys(this.state.AOIs).forEach(aoi => {
                        if (
                                this.state.AOIs[aoi].ranges.length &&
                                this.state.AOIs[aoi].ranges[this.state.AOIs[aoi].ranges.length - 1].length === 1
                        ) {
                                this.state.AOIs[aoi].ranges[this.state.AOIs[aoi].ranges.length - 1].push(end);
                                this.calcEEG(aoi);
                        }
                });
        };
        calcEEG = aoi => {
                if (!this.props.eeg) {
                        return;
                }
                const AOIs = this.state.AOIs;
                AOIs[aoi].values = [];
                AOIs[aoi].ranges.forEach(range => {
                        if (!range[1]) {
                                return;
                        }
                        const start = readIMotionsDate(range[0]);
                        const end = readIMotionsDate(range[1]);
                        let count = 0;
                        let sum = 0;
                        this.props.eeg.forEach(eeg => {
                                if (eeg.t >= start && eeg.t <= end) {
                                        ++count;
                                        sum += eeg.v;
                                }
                        });
                        console.log(sum, count);
                        AOIs[aoi].values.push([sum, count, sum / count]);
                });
                this.setState({ AOIs });
        };
        generateName = () => "AOIs_ranges.txt";
        downloadRanges = () => {
                const text = Object.keys(this.state.AOIs)
                        .map(aoi =>
                                this.state.AOIs[aoi].ranges
                                        .map(
                                                r =>
                                                        aoi +
                                                        "\t" +
                                                        this.state.AOIs[aoi].label +
                                                        "\t" +
                                                        readIMotionsDate(r[0]).getTime() +
                                                        "\t" +
                                                        readIMotionsDate(r[1]).getTime()
                                        )
                                        .join("\n")
                        )
                        .join("\n");
                const element = document.createElement("a");
                element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
                element.setAttribute("download", this.generateName());

                element.style.display = "none";
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
        };
        calculateGazes = (__start, __end) => {
                if (!this.props.gaze || !this.props.iframe) {
                        return;
                }
                const _start = new Date(this.state.beginning);
                const _end = new Date(this.state.beginning);
                _start.setMilliseconds(_start.getMilliseconds() + __start);
                _end.setMilliseconds(_end.getMilliseconds() + __end);
                const startM = formatMachineDateTime(_start);
                const endM = formatMachineDateTime(_end);
                const startD = _start.getTime();
                const endD = _end.getTime();
                const AOIs = { ...this.state.AOIs };
                let i = this.state.lastGazeI;
                let e = this.state.lastEegI;
                let lastAOI = this.state.lastGazeAOI;
                for (; i < this.props.gaze.length; ++i) {
                        if (this.props.gaze[i].x == -1 || this.props.gaze[i].y == -1) {
                                continue;
                        }
                        if (this.props.gaze[i].time >= startM && this.props.gaze[i].time < endM) {
                                const elm = this.props.iframe.contentWindow.document.elementFromPoint(
                                        this.props.gaze[i].x,
                                        this.props.gaze[i].y - this.props.offsetTop
                                );
                                let aoiHit = false;
                                // eslint-disable-next-line no-loop-func
                                Object.keys(AOIs).forEach(aoi => {
                                        if (hasParent(elm, aoi)) {
                                                aoiHit = true;
                                                if (!lastAOI) {
                                                        if (
                                                                // So there will not be small holes in ranges
                                                                AOIs[aoi] &&
                                                                AOIs[aoi].ranges.length &&
                                                                AOIs[aoi].ranges[AOIs[aoi].ranges.length - 1][1] &&
                                                                this.props.gaze[i].time -
                                                                        AOIs[aoi].ranges[
                                                                                AOIs[aoi].ranges.length - 1
                                                                        ][1] <
                                                                        1500
                                                        ) {
                                                                AOIs[aoi].ranges[
                                                                        AOIs[aoi].ranges.length - 1
                                                                ].length = 1;
                                                                this.calcEEG(aoi);
                                                        } else {
                                                                AOIs[aoi].ranges.push([this.props.gaze[i].time]);
                                                        }
                                                        lastAOI = aoi;
                                                } else if (lastAOI !== aoi) {
                                                        console.log("lastAOI !== aoi", lastAOI, aoi);
                                                        AOIs[lastAOI].ranges[
                                                                AOIs[lastAOI].ranges.length - 1
                                                        ][1] = this.props.gaze[i].time;
                                                        this.calcEEG(lastAOI);
                                                        AOIs[aoi].ranges.push([this.props.gaze[i].time]);
                                                        lastAOI = aoi;
                                                }
                                        }
                                });
                                if (lastAOI && !aoiHit) {
                                        console.log("else if (lastAOI)", lastAOI, elm);
                                        AOIs[lastAOI].ranges[AOIs[lastAOI].ranges.length - 1][1] = this.props.gaze[
                                                i - 1
                                        ].time;
                                        this.calcEEG(lastAOI);
                                        lastAOI = null;
                                }
                        }
                        if (this.props.gaze[i].time >= endM) {
                                break;
                        }
                }
                this.setState({ lastGazeI: i, lastEegI: e, lastGazeAOI: lastAOI, AOIs });
        };
        render() {
                const start = this.props.gaze && readIMotionsDate(this.props.gaze[0].time).getTime();
                if (!this.props.AOIs) {
                        return null;
                }
                return (
                        <AOIsContainer>
                                <h3>AOIs:</h3>
                                {Object.keys(this.state.AOIs).map(path => (
                                        <div key={path}>
                                                <div className="label">{this.state.AOIs[path].label}</div>
                                                <div className="path">{path}</div>
                                                {this.state.AOIs[path].ranges.map((r, i) => (
                                                        <ul>
                                                                <li>
                                                                        {(readIMotionsDate(r[0]).getTime() - start) /
                                                                                1000}
                                                                        {"s "}-{" "}
                                                                        {r[1] &&
                                                                                (readIMotionsDate(r[1]).getTime() -
                                                                                        start) /
                                                                                        1000}
                                                                        s
                                                                        {this.state.AOIs[path].values &&
                                                                                this.state.AOIs[path].values.length && (
                                                                                        <>
                                                                                                {": "}
                                                                                                {this.state.AOIs[path]
                                                                                                        .values &&
                                                                                                        this.state.AOIs[
                                                                                                                path
                                                                                                        ].values[i] &&
                                                                                                        this.state.AOIs[
                                                                                                                path
                                                                                                        ].values[
                                                                                                                i
                                                                                                        ].join()}
                                                                                        </>
                                                                                )}
                                                                </li>
                                                        </ul>
                                                ))}
                                        </div>
                                ))}
                                <button onClick={this.downloadRanges}>Download ranges {this.generateName()}</button>
                        </AOIsContainer>
                );
        }
}
