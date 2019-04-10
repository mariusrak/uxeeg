import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

const EEGContainer = styled.div`
        /* position: absolute; */
        /* bottom: 80px; */
        /* left: 0;
        right: 0; */
        height: 250px;
        background: #fff;

        /* canvas {
                width: 100%;
                height: 100%;
        } */
`;

class EEG extends React.Component {
        state = { width: null, height: null };
        draw() {
                console.log("drawing");
                const points = this.props.data.map(d => d.v);
                const min = Math.min(...points) * 1.05;
                const max = Math.max(...points);
                const d2y = v => ((v - min) / (max - min)) * this.state.height;
                const step = this.state.width / points.length;
                const ctx = this.canvas.getContext("2d");
                ctx.moveTo(0, 999);
                points.forEach((d, i) => {
                        ctx.lineTo(step * (i + 1), d2y(d) * 0.95);
                });
                ctx.stroke();
        }
        componentDidMount() {
                this.componentDidUpdate();
        }
        componentDidUpdate() {
                if (
                        !this.canvas ||
                        !this.container ||
                        !document.body.contains(this.canvas) ||
                        !document.body.contains(this.container)
                ) {
                        return;
                }
                const rect = ReactDOM.findDOMNode(this.container).getBoundingClientRect();
                if (!rect) {
                        return;
                }
                if (rect.width !== this.state.width || rect.height !== this.state.height) {
                        this.setState({ width: rect.width, height: rect.height }, () => {
                                this.draw();
                        });
                }
        }
        render() {
                return (
                        <EEGContainer
                                ref={c => {
                                        this.container = c;
                                }}
                        >
                                <canvas
                                        {...this.state}
                                        ref={c => {
                                                this.canvas = c;
                                        }}
                                />
                        </EEGContainer>
                );
        }
}

export default EEG;
