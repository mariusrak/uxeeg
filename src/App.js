import React, { Component } from "react";
import styled from "styled-components";
const { open_file, load_replay } = window.require("electron").remote.require("./play.js");

const Controls = styled.div``;
const LoadStyled = styled.input``;
const Load = props => <LoadStyled type="file" {...props} />;

const click = () => {
        window._get_handlers().then(r => console.log(r));
};

class App extends Component {
        render() {
                return (
                        <Controls>
                                <Load onChange={e => open_file(e.target.files)} />
                                <button onClick={() => load_replay()}>Load Replay</button>
                        </Controls>
                );
        }
}

export default App;
