import { Router, Route } from "wouter";
import { Homepage } from "./views/Homepage";
import { NewGame } from "./views/NewGame";

function App() {
    return (
        <Router>
            <Route path="/game/new" component={NewGame} />
            <Route path="/" component={Homepage} />
        </Router>
    );
}

export default App;
