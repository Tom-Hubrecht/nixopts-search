import { Document } from "flexsearch";
import {
  Accessor,
  For,
  Resource,
  Setter,
  Show,
  type Component,
} from "solid-js";
import { SetStoreFunction, Store } from "solid-js/store";

const Form: Component<{
  selected: Accessor<string>;
  setSelected: Setter<string>;
  modules: { [propName: string]: Module };
  store: Store<SearchStore>;
  setStore: SetStoreFunction<SearchStore>;
  index: Resource<Document<Option, false, false>>;
  shownOptions: Accessor<Option[]>;
  limited: () => boolean;
}> = (props) => {
  return (
    <>
      <div class="field is-horizontal">
        <div class="field-body">
          <div class="field is-flex-grow-0">
            <div class="control">
              <div class="select is-fullwidth">
                <select
                  value={props.selected()}
                  onInput={(e) => props.setSelected(e.currentTarget.value)}
                >
                  <For each={Object.entries(props.modules)}>
                    {([key, mod]) => <option value={key}>{mod.title}</option>}
                  </For>
                </select>
              </div>
            </div>
          </div>

          <div class="field is-expanded">
            <div class="field has-addons">
              <div class="control is-expanded">
                <input
                  class="input"
                  type="text"
                  placeholder="Options Search"
                  value={props.store.query}
                  oninput={(e) => props.setStore("query", e.target.value)}
                />
              </div>

              <div class="control">
                <span
                  class="button is-static"
                  classList={{ "is-loading": props.index.loading }}
                  style="width: 10em"
                >
                  {
                    <>
                      {props.shownOptions().length}
                      <Show when={props.limited()}>+</Show>
                    </>
                  }
                  &nbsp;options
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="field has-addons">
        <div class="control">
          <label class="button is-fullwidth is-small is-shadowless">
            <input
              type="checkbox"
              checked={props.store.titleSearch}
              oninput={(e) => props.setStore("titleSearch", e.target.checked)}
            />
            <span class="ml-2">Search in title</span>
          </label>
        </div>

        <div class="control">
          <label class="button is-fullwidth is-small is-shadowless">
            <input
              type="checkbox"
              checked={props.store.descrSearch}
              oninput={(e) => props.setStore("descrSearch", e.target.checked)}
            />
            <span class="ml-2">Search in description</span>
          </label>
        </div>
      </div>
    </>
  );
};

export default Form;
