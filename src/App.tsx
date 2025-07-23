import { createResource, Match, Show, Switch, type Component } from "solid-js";
import { Puff } from "solid-spinner";

import Footer from "./components/Footer.jsx";
import NavBar from "./components/NavBar.jsx";
import Search from "./components/Search.jsx";

const fetchMeta = async () => {
  const response = await fetch("meta.json");
  return response.json();
};

const App: Component = () => {
  const [meta] = createResource<Meta>(fetchMeta);

  return (
    <>
      <Switch>
        <Match when={meta.loading}>
          <NavBar links={[]}></NavBar>
          <Puff height="22" color="#ffcf9d" />
        </Match>
        <Match when={meta.state === "ready"}>
          <>
            <NavBar links={meta.latest!.links} />

            <Search meta={meta.latest!} />
          </>
        </Match>
      </Switch>
      <Footer />
    </>
  );
};

export default App;
