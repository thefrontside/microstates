const { danger, markdown } = require('danger');
const pjson = require('../package.json');

const latest = danger.github.pr.commits - 1;
const shorted = danger.github.commits[latest].sha.slice(0, 7);

const currentNPM = `https://www.npmjs.com/package/${pjson.name}/v/${pjson.version}-${shorted}`

markdown(`This PR is available to use:`);
markdown('```bash');
markdown(`npm install ${pjson.name}@${pjson.version}-${shorted}`);
markdown('```');
markdown(`You can view the NPM package [here](${currentNPM}).`);