import { Component } from "solid-js";

const Row: Component<{ option: Option; show: () => void }> = ({
  option,
  show,
}) => (
  <tr onclick={show}>
    <td
      class="is-family-monospace"
      innerHTML={option.title.replaceAll(".", ".<wbr>")}
    ></td>
    <td class="is-hidden-touch ellipsis">{option.description}</td>
    <td class="is-hidden-touch">{option.type}</td>
  </tr>
);

export default Row;
