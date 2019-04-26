import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

const TimeLineStyled = styled.div`
        position: relative;
        width: 100%;
        margin: 5px 0;
        cursor: col-resize;
        border: solid #777;
        border-width: 1px 0;
        min-height: 10px;
        overflow: hidden;
`;
const TimeLinePrgress = styled.div`
        background: rgba(25, 25, 25, 0.5);
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
`;
const TimeLineWindow = styled.div`
        background: rgba(25, 25, 25, 0.5);
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 100%;

        &::before {
                content: "";
                background: inherit;
                position: absolute;
                left: calc(-100% - 10px);
                top: inherit;
                bottom: inherit;
                width: inherit;
        }
`;
const ChildrenCntainer = styled.div`
        /* position: absolute; */
`;

const TimeLine = ({ total, current, onChange, children }) => {
        let ref;
        return (
                <TimeLineStyled
                        onClick={e => {
                                const rect = ReactDOM.findDOMNode(ref).getBoundingClientRect();
                                onChange(Math.round(((e.pageX - rect.x) / rect.width) * total));
                        }}
                        ref={r => (ref = r)}
                >
                        <ChildrenCntainer>{children}</ChildrenCntainer>
                        {children ? (
                                <TimeLineWindow style={{ left: "calc(" + (current / total) * 100 + "% + 10px)" }} />
                        ) : (
                                <TimeLinePrgress style={{ width: (current / total) * 100 + "%" }} />
                        )}
                </TimeLineStyled>
        );
};

export default TimeLine;
