import { Router, Route } from "wouter";
import { Homepage } from "./views/Homepage";
import { CreateGame } from "./views/Create";

function App() {
    return (
        <Router>
            <Route path="/create" component={CreateGame} />
            <Route path="/" component={Homepage} />
        </Router>
    );
}

export default App;
