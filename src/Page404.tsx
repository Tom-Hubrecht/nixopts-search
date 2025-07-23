import { Component } from "solid-js";
import NavBar from "./components/NavBar.jsx";
import Footer from "./components/Footer.jsx";
import { IconArrowLoopLeft2, IconFaceIdError } from "@tabler/icons-solidjs";

const Page404: Component = () => (
  <>
    <NavBar links={[]} />

    <div class="notification has-text-centered is-primary is-light is-size-4 m-6">
      <p class="block">
        <span class="icon-text">
          <span class="icon">
            <IconFaceIdError />
          </span>
          <span>
            <b>Error:</b>&nbsp;Page not found
          </span>
        </span>
      </p>

      <a href="/" class="button is-dark">
        <span class="icon">
          <IconArrowLoopLeft2 />
        </span>
        <span>Go Home</span>
      </a>
    </div>

    <Footer />
  </>
);

export default Page404;
