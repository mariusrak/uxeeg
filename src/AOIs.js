import React from "react";
import styled from "styled-components";
import { formatMachineDateTime } from "./utils";

class Input extends React.Component {
        state = { value: "" };
        render() {
                return (
                        <>
                                xpath:
                                <input
                                        onChange={e => this.setState({ value: e.target.value })}
                                        value={this.state.value}
                                />
                                <button
                                        onClick={() => {
                                                this.props.onAdd(this.state.value);
                                                this.setState({ value: "" });
                                        }}
                                >
                                        Add
                                </button>
                        </>
                );
        }
}

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
        state = { AOIs: {}, lastGazeI: 0 };
        componentDidUpdate(prevProps) {
                if (!this.props.gaze) {
                        return;
                }
                if (!prevProps.gaze || prevProps.gaze[0].time !== this.props.gaze[0].time) {
                        const t = this.props.gaze[0].time.toString();
                        const p = [
                                t.substr(0, 4),
                                t.substr(4, 2) - 1,
                                t.substr(6, 2),
                                t.substr(8, 2),
                                t.substr(10, 2),
                                t.substr(12, 2),
                                t.substr(14, 3)
                        ];
                        this.setState({ beginning: new Date(...p) });
                }
        }
        calculateGazes = (__start, __end) => {
                if (!this.props.gaze || !this.props.iframe) {
                        return;
                }
                const _start = new Date(this.state.beginning);
                const _end = new Date(this.state.beginning);
                _start.setMilliseconds(_start.getMilliseconds() + __start);
                _end.setMilliseconds(_end.getMilliseconds() + __end);
                const start = formatMachineDateTime(_start);
                const end = formatMachineDateTime(_end);
                const AOIs = { ...this.state.AOIs };
                let i = this.state.lastGazeI;
                for (; i < this.props.gaze.length; ++i) {
                        if (this.props.gaze[i].time >= start && this.props.gaze[i].time < end) {
                                const elm = this.props.iframe.contentWindow.document.elementFromPoint(
                                        this.props.gaze[i].x,
                                        this.props.gaze[i].y
                                );
                                Object.keys(AOIs).forEach(aoi => {
                                        if (hasParent(elm, aoi)) {
                                                ++AOIs[aoi];
                                                // console.log(aoi, this.props.gaze[i].x, this.props.gaze[i].y);
                                        }
                                });
                        }
                        if (this.props.gaze[i].time >= end) {
                                break;
                        }
                }
                this.setState({ lastGazeI: i, AOIs });
        };
        render() {
                return (
                        <>
                                <ul>
                                        <li>
                                                xpath: <b>gazes</b>
                                        </li>
                                        {Object.keys(this.state.AOIs).map(a => (
                                                <li>
                                                        {a}: {this.state.AOIs[a]}
                                                </li>
                                        ))}
                                </ul>
                                <Input onAdd={v => this.setState({ AOIs: { ...this.state.AOIs, [v]: 0 } })} />
                        </>
                );
        }
}
