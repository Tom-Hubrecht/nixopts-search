import {
  Component,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  Show,
} from "solid-js";

import OptionModal from "./Search/Modal.jsx";
import { IconCodeVariablePlus } from "@tabler/icons-solidjs";
import { Document, Encoder } from "flexsearch";
import { createScheduled, debounce } from "@solid-primitives/scheduled";
import { createStore } from "solid-js/store";
import { useSearchParams } from "@solidjs/router";
import Form from "./Search/Form.jsx";
import Row from "./Search/Row.jsx";

const CHUNK_SIZE = 250;
function normalize<T>(value: string | string[] | undefined, _default: T) {
  if (typeof value == "string") return value;
  if (value) return value[0];

  return _default;
}

const Search: Component<{ meta: Meta }> = ({ meta }) => {
  const fetchOptions = async (key: string) => {
    const response = await fetch(meta.modules[key].path);
    return response.json() as Promise<Option[]>;
  };

  const encoder = new Encoder({
    normalize: true,
    dedupe: false,
    cache: false,
    include: {
      letter: true,
      number: true,
      symbol: false,
      punctuation: false,
      control: false,
      char: ["<", ">", "*", "."],
    },
  });

  const [searchParams, setSearchParams] = useSearchParams();

  const [store, setStore] = createStore<SearchStore>({
    limit: CHUNK_SIZE,
    selectedOption: null,
    query: normalize(searchParams.query, ""),
    titleSearch: Boolean(normalize(searchParams.title, true)),
    descrSearch: Boolean(normalize(searchParams.descr, true)),
  });

  const set = normalize(searchParams.set, meta.defaultSet);

  const [selected, setSelected] = createSignal(
    set in meta.modules ? set : meta.defaultSet,
  );
  const [options] = createResource(selected, fetchOptions, {
    initialValue: [],
  });

  const [index] = createResource(options, async (opts) => {
    const doc = new Document<Option>({
      document: {
        id: "title",
        store: true,
        index: [
          { field: "title", tokenize: "full", encoder },
          { field: "description", tokenize: "forward" },
        ],
      },
    });

    for (const [idx, opt] of opts.entries()) {
      await doc.addAsync(idx, opt);
    }

    return doc;
  });

  const increaseLimit = () => setStore("limit", (prev) => prev + CHUNK_SIZE);

  const scheduled = createScheduled((fn) => debounce(fn, 50));

  const shownOptions = createMemo((prev: Option[] | undefined) => {
    const idx = index();

    if (!scheduled() || !idx) {
      return prev || [];
    }

    const q = store.query;
    const field = [
      ...(store.titleSearch ? ["title"] : []),
      ...(store.descrSearch ? ["description"] : []),
    ] as ("title" | "description")[];

    const results =
      q === ""
        ? options()
        : (idx
            .search(q, {
              field,
              limit: store.limit,
              merge: true,
              enrich: true,
            })
            .map(({ doc }) => doc)
            .filter((x) => x) as Option[]);

    return results.slice(0, store.limit);
  });

  const limited = () => shownOptions().length === store.limit;

  createEffect(() => {
    if (options.loading) {
      setStore("limit", CHUNK_SIZE);
    }
  });

  createEffect(() => {
    setSearchParams({
      query: store.query,
      set: selected(),
      title: store.titleSearch || "",
      descr: store.descrSearch || "",
    });
  });

  return (
    <div class="container px-4 mb-6">
      <div id="search-form">
        <Form
          {...{
            limited,
            selected,
            setSelected,
            modules: meta.modules,
            store,
            setStore,
            index,
            shownOptions,
          }}
        />

        <table class="table is-fullwidth">
          <thead>
            <tr>
              <th>Name</th>
              <th class="is-hidden-touch">Description</th>
              <th class="is-hidden-touch">Type</th>
            </tr>
          </thead>
        </table>
      </div>

      <Show when={store.selectedOption}>
        {(o) => (
          <OptionModal
            option={o()}
            resetOption={() => setStore("selectedOption", null)}
          />
        )}
      </Show>

      <table class="table is-fullwidth is-narrow is-hoverable is-striped">
        <tbody>
          <For each={shownOptions()}>
            {(o) => (
              <Row option={o} show={() => setStore("selectedOption", o)} />
            )}
          </For>
        </tbody>
      </table>

      <Show when={shownOptions().length >= store.limit}>
        <button class="button is-fullwidth" onclick={increaseLimit}>
          <span>Load more</span>
          <span class="icon">
            <IconCodeVariablePlus />
          </span>
        </button>
      </Show>
    </div>
  );
};

export default Search;
