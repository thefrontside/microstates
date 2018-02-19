import { map, append, foldl } from 'funcadelic';

export function visualize(tree, value, level = 0) {
  let node = tree.data;
  let { Type, path } = node;
  // puts '| | | ' before a line to denote how deep in the tree it is
  let preamble = Array(level).fill(0).map(() => '|  ').join('');

  // render the line for this child
  let lines = [`${preamble}${path.length ? path[path.length - 1]: 'root'} :: ${JSON.stringify({ Type: Type.name, path, value: node.valueAt(value) })}`];

  // convert all children into arrays
  let children = tree.children instanceof Array ? tree.children : Object.values(tree.children);
  // render the lines for the children.
  let childLines = map(child => visualize(child, value, level + 1), children);

  // flatten the child lines into a single array (insted of an array of arrays)
  return lines.concat(foldl((lines, l) => lines.concat(l), [], childLines));
}
export default function logTree(tree, value) {
  console.log(visualize(tree, value).join("\n"));
}
