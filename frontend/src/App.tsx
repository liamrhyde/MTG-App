import { Router, Route, Switch } from "wouter";
import { Homepage } from "./views/Homepage";
import { NewGame } from "./views/NewGame";
import { GameView } from "./views/Game/GameView";

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/game/new" component={NewGame} />
                <Route path="/game/:gameId" component={GameView} />
                <Route path="/" component={Homepage} />
            </Switch>
        </Router>
    );
}

export default App;
