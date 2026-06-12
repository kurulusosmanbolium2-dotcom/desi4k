import { Switch, Route } from "wouter";
import HomePage from "./pages/HomePage";
import VideoPage from "./pages/VideoPage";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/video/:id" component={VideoPage} />
    </Switch>
  );
}
