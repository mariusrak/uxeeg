import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

const EEGContainer = styled.div`
        height: 250px;
        background: #fff;
`;
const Stats = styled.div`
        position: absolute;
        bottom: 0;
`;
const CanvasContainer = styled.div`
        /* Permalink - use to edit and share this gradient: http://colorzilla.com/gradient-editor/#00ff00+0,00ff00+25,ffff00+40,ffff00+60,ff0000+75,ff0000+100 */
        background: #00ff00; /* Old browsers */
        background: -moz-linear-gradient(
                top,
                #00ff00 0%,
                #00ff00 25%,
                #ffff00 40%,
                #ffff00 60%,
                #ff0000 75%,
                #ff0000 100%
        ); /* FF3.6-15 */
        background: -webkit-linear-gradient(
                top,
                #00ff00 0%,
                #00ff00 25%,
                #ffff00 40%,
                #ffff00 60%,
                #ff0000 75%,
                #ff0000 100%
        ); /* Chrome10-25,Safari5.1-6 */
        background: linear-gradient(
                to bottom,
                #00ff00 0%,
                #00ff00 25%,
                #ffff00 40%,
                #ffff00 60%,
                #ff0000 75%,
                #ff0000 100%
        ); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
        filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00ff00', endColorstr='#ff0000',GradientType=0 ); /* IE6-9 */
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
                ctx.clearRect(0, 0, this.state.width, this.state.height);
                ctx.beginPath();
                ctx.fillStyle = "transparent";
                ctx.fillRect(0, 0, this.state.width, this.state.height);
                ctx.moveTo(0, 999);
                points.forEach((d, i) => {
                        ctx.lineTo(step * (i + 1), d2y(d) * 0.95);
                });
                ctx.lineWidth = 3;
                ctx.stroke();
        }
        componentDidMount() {
                this.componentDidUpdate();
        }
        componentDidUpdate(prevProps) {
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
                if (
                        rect.width !== this.state.width ||
                        rect.height !== this.state.height ||
                        prevProps.data !== this.props.data
                ) {
                        this.setState({ width: rect.width, height: rect.height }, () => {
                                this.draw();
                        });
                }
        }
        render() {
                const points = this.props.data.map(d => d.v);
                const min = Math.min(...points);
                const max = Math.max(...points);
                const avg = points.reduce((tot, cur) => tot + cur, 0) / points.length;
                return (
                        <EEGContainer
                                ref={c => {
                                        this.container = c;
                                }}
                        >
                                <CanvasContainer>
                                        <canvas
                                                {...this.state}
                                                ref={c => {
                                                        this.canvas = c;
                                                }}
                                        />
                                </CanvasContainer>
                                <Stats>
                                        Min: {min} Max: {max}: Avg: {avg}
                                </Stats>
                        </EEGContainer>
                );
        }
}

export default EEG;
