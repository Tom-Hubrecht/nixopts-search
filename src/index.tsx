/* @refresh reload */
import { render } from "solid-js/web";

import App from "./App.jsx";
import "./msearch.scss";
import { Route, Router } from "@solidjs/router";
import Page404 from "./Page404.jsx";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(
  () => (
    <Router>
      <Route path="/" component={App} />
      <Route path="/*" component={Page404} />
    </Router>
  ),
  root!,
);
