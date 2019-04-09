import React from "react";
import styled from "styled-components";
import { Charts, ChartContainer, ChartRow, YAxis, LineChart, Baseline } from "react-timeseries-charts";

const ChartContainerStyled = styled(ChartContainer)`
        position: absolute;
        bottom: 50px;
`;
const baselineStyleLite = {
        line: {
                stron: "steelblue",
                strokeWidth: 1,
                opacity: 0.5
        },
        label: {
                fill: "steelblue"
        }
};
const baselineStyle = {
        line: {
                stron: "steelblue",
                strokeWidth: 1,
                opacity: 0.4,
                strokeDasharray: "none"
        },
        label: {
                fill: "steelblue"
        }
};

class EEG extends React.Component {
        render() {
                const series = this.props.data;
                return (
                        <ChartContainerStyled timeRange={series.range()} format="relative">
                                <ChartRow height="150">
                                        <YAxis
                                                id="eeg"
                                                label="Value from EEG"
                                                min={series.min()}
                                                max={series.max()}
                                                width="60"
                                                format="relative"
                                        />
                                        <Charts>
                                                <LineChart axis="eeg" series={series} />
                                                <Baseline
                                                        axis="eeg"
                                                        style={baselineStyleLite}
                                                        value={series.max()}
                                                        label="Max"
                                                        position="right"
                                                />
                                                <Baseline
                                                        axis="eeg"
                                                        style={baselineStyleLite}
                                                        value={series.min()}
                                                        label="Min"
                                                        position="right"
                                                />
                                                <Baseline
                                                        axis="eeg"
                                                        style={baselineStyleLite}
                                                        value={series.avg() - series.stdev()}
                                                />
                                                <Baseline
                                                        axis="eeg"
                                                        style={baselineStyleLite}
                                                        value={series.avg() + series.stdev()}
                                                />
                                                <Baseline
                                                        axis="eeg"
                                                        style={baselineStyle}
                                                        value={series.avg()}
                                                        label="Avg"
                                                />
                                        </Charts>
                                </ChartRow>
                        </ChartContainerStyled>
                );
        }
}

export default EEG;
