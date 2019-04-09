import React from "react";
import { formatDate, formatDateTime, formatTime } from "./utils";

const EventsData = props => {
        if (!props.events) {
                return null;
        }
        const eventIndex = props.event;
        const date = formatDate(props.events[0].timestamp);
        const start = formatTime(props.events[0].timestamp);
        const end = formatTime(props.events[props.events.length - 1].timestamp);
        const _totalTime = Math.round(
                (props.events[props.events.length - 1].timestamp - props.events[0].timestamp) / 1000
        );
        const totalTime =
                Math.round(_totalTime / 60) + (_totalTime % 60 < 10 ? ":0" : ":") + Math.round(_totalTime % 60);
        const rTime =
                Math.round(props.time / 60000) +
                ":" +
                ((props.time / 1000) % 60 < 10 ? "0" : "") +
                (Math.round(props.time / 1000) % 60);
        const aTime = formatDateTime(props.events[0].timestamp + props.time);

        return (
                <>
                        Date: <b>{date}</b> Start: <b>{start}</b> End: <b>{end}</b>{" "}
                        {props.time && (
                                <>
                                        Begin: <b>{props.events[0].timestamp}</b> End:{" "}
                                        <b>{props.events[props.events.length - 1].timestamp}</b> Timestamp:{" "}
                                        <b>{eventIndex > 0 && props.events[eventIndex].timestamp}</b> Frame:{" "}
                                        <b>
                                                {eventIndex}/{props.events.length}
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
};

export default props => (
        <>
                <EventsData {...props} />
                {props.file_web && (
                        <>
                                {" "}
                                File web: <b>{props.file_web}</b> {props.events ? "✔" : "❌"}
                        </>
                )}
                {props.file_gaze && (
                        <>
                                {" "}
                                File gaze: <b>{props.file_gaze}</b> {props.gaze ? "✔" : "❌"}
                        </>
                )}
                {props.file_eeg && (
                        <>
                                {" "}
                                File EEG: <b>{props.file_eeg}</b> {props.eeg ? "✔" : "❌"}
                        </>
                )}
        </>
);
