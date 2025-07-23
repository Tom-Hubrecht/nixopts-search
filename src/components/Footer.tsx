import { IconBrandGithubFilled } from "@tabler/icons-solidjs";
import type { Component } from "solid-js";

const Footer: Component = () => {
  return (
    <footer class="footer has-text-centered pt-6">
      <div class="tags is-centered">
        <a
          class="button is-small"
          href="https://github.com/Tom-Hubrecht/msearch"
        >
          <span class="icon">
            <IconBrandGithubFilled />
          </span>
          <span>Source Code</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
