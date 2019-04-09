import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

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

export default TimeLine;
