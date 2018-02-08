const M = require('./dist/index');
const { analyze } = M;
const { map, append, foldl } = require('funcadelic');

let tree = analyze(class Session {
  constructor() {
    this.user = class User {
      constructor() {
        this.firstName = M.String;
        this.lastName = M.String;
      }
      get fullName() {
        return this.firstName + this.lastName;
      }
    };
    this.isAuthenticated = M.Boolean;
  }
}, {
  user: {
    firstName: 'Charles',
    lastName: 'Lowell'
  },
  isAuthenticated: false
});



// The strategy is to build up a list of lines that can be printed to the console.
function visualize(tree, level = 0) {
  let { Type, path, value } = tree.data;
  // puts '| | | ' before a line to denote how deep in the tree it is
  let preamble = Array(level).fill(0).map(() => '|  ').join('');

  // render the line for this child
  let lines = [`${preamble}${path.length ? path[path.length - 1]: 'root'} :: ${JSON.stringify({ path, value })}`];

  // convert all children into arrays
  let children = tree.children instanceof Array ? tree.children : Object.values(tree.children);
  // render the lines for the children.
  let childLines = map(child => visualize(child, level + 1), children);

  // flatten the child lines into a single array (insted of an array of arrays)
  return lines.concat(foldl((lines, l) => lines.concat(l), [], childLines));
}

process.stdout.write(visualize(tree).join("\n"));
