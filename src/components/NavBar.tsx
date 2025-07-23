import { createSignal, For, type Component } from "solid-js";

const NavBar: Component<{ links: NavbarLink[] }> = ({ links }) => {
  const [active, setActive] = createSignal(false);

  return (
    <nav>
      <div class="navbar is-fixed-top has-background-primary">
        <div class="navbar-brand">
          <span class="navbar-item" title="NixOpts Search">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-list-search"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M15 15m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
              <path d="M18.5 18.5l2.5 2.5" />
              <path d="M4 6h16" />
              <path d="M4 12h4" />
              <path d="M4 18h4" />
            </svg>
          </span>
          <a
            role="button"
            class="navbar-burger"
            classList={{ "is-active": active() }}
            aria-label="menu"
            aria-expanded="false"
            onclick={() => setActive(!active())}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div class="navbar-menu" classList={{ "is-active": active() }}>
          <For each={links}>
            {({ name, href }) => (
              <a class="navbar-item" href={href}>
                {name}
              </a>
            )}
          </For>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
