import { createEffect, For, Show, type Component } from "solid-js";

import { useKeyDownEvent } from "@solid-primitives/keyboard";

import hljs from "highlight.js/lib/core";
import nix from "highlight.js/lib/languages/nix";

import "highlight.js/scss/atom-one-light.scss";
import { IconLock } from "@tabler/icons-solidjs";

hljs.registerLanguage("nix", nix);

const OptionModal: Component<{
  option: Option;
  resetOption: () => void;
}> = ({ option, resetOption }) => {
  const event = useKeyDownEvent();

  createEffect(() => {
    const e = event();

    if (e && e.key == "Escape") {
      resetOption();
      e.preventDefault(); // prevent default behavior or last keydown event
    }
  });

  return (
    <div class="modal is-active px-3">
      <div class="modal-background" onclick={resetOption}></div>
      <button
        class="modal-close is-large"
        aria-label="close"
        onclick={resetOption}
      ></button>
      <div class="modal-card">
        <header class="modal-card-head">
          <button
            class="delete is-pulled-right"
            aria-label="close"
            onclick={resetOption}
          ></button>
          <p
            class="modal-card-title is-size-6 is-family-monospace"
            innerHTML={option.title.replaceAll(".", ".<wbr>")}
          ></p>
        </header>
        <section class="modal-card-body content mb-0">
          <Show when={option.readOnly}>
            <p class="button is-primary is-light is-fullwidth">
              <span class="icon">
                <IconLock />
              </span>
              <b>Read only</b>
            </p>
          </Show>

          <b>Description:</b>
          <p innerHTML={option.descriptionHTML}></p>

          <p>
            <b>Type:</b>&nbsp;<span>{option.type}</span>
          </p>

          <Show when={option.default}>
            <b>Default value:</b>
            <pre
              innerHTML={
                hljs.highlight(option.default!, { language: "nix" }).value
              }
            ></pre>
          </Show>

          <Show when={option.example}>
            <b>Example value:</b>
            <pre
              innerHTML={
                hljs.highlight(option.example!, { language: "nix" }).value
              }
            ></pre>
          </Show>
        </section>
        <footer class="modal-card-foot buttons py-4">
          <For each={option.declarations}>
            {(decl) => (
              <a href={decl.url} class="button is-small is-link is-light">
                {decl.name}
              </a>
            )}
          </For>
        </footer>
      </div>
    </div>
  );
};

export default OptionModal;
