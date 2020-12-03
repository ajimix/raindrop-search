const readline = require('readline');
const fs = require('fs');
const path = require('path');

function question(rl, query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => resolve(answer));
  });
}

function configure() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const config = {};

  return question(
    rl,
    'Create a Raindrop app and then create a test token (check README.md for more info).\nTest token: '
  )
    .then((token) => {
      if (token.length < 20) {
        console.log('Token seems to be invalid, please start again');
        process.exit(1);
      }
      config.token = token;
      return question(
        rl,
        '\nHow many parallel requests to do to the API when caching?\nPlay with this number if you have thousands of bookmarks, otherwise the default should work.\nPress enter for default (5): '
      );
    })
    .then((cacheParallel) => {
      if (cacheParallel.length === 0) {
        cacheParallel = 5;
      }
      config.cacheParallel = cacheParallel * 1;
      return question(rl, '\nHow many maximum results to show when searching?\nPress enter for default (8): ');
    })
    .then((maxResults) => {
      if (maxResults.length === 0) {
        maxResults = 8;
      }
      config.maxResults = maxResults * 1;
      // console.log(`\nThe following config was saved:\n${JSON.stringify(config, null, 2)}\n`);
      return fs.writeFileSync(path.resolve(__filename, '../../config.json'), JSON.stringify(config, null, 2));
    })
    .catch((err) => {
      console.error(err);
    });
}

module.exports = configure;
