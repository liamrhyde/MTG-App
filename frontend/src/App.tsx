import { Router, Route } from "wouter";
import { Homepage } from "./views/Homepage";

function App() {
    return (
        <Router>
            <Route path="/" component={Homepage} />
        </Router>
    );
}

export default App;
