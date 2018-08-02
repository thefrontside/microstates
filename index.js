/** HOTFIX
* workaround for https://github.com/microstates/microstates.js/issues/186
* this lines should not be necessary because syntactic sugar precedence should be
* deterministic.
*/
import "./src/types";
/** END HOTFIX */

export { create } from './src/microstates';
export { default as from } from './src/literal';
export { map, filter, reduce } from './src/query';
