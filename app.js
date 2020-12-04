#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { loadDb } = require('./src/db.js');
const colors = require('colors');
const { searchBookmarks, presentResults, presentAlfredResults } = require('./src/search-bookmarks.js');
const cacheBookmarks = require('./src/cache-bookmarks.js');
const configure = require('./src/configure.js');

const args = process.argv.slice(2);
let searchTerm = args.join(' ').trim();
let isAlfred = false;

if (searchTerm === '') {
  console.error('Please specify a search term or --cache or --configure');
  process.exit(1);
}

loadDb()
  .then(() => {
    if (searchTerm === '--configure') {
      return configure().then(() => {
        console.log(colors.green("Configured successfully. Don't forget to run rds --cache"));
        process.exit(0);
      });
    }

    if (searchTerm.indexOf('--alfred') === 0) {
      isAlfred = true;
      searchTerm = searchTerm.replace('--alfred', '').trim();
    }

    if (!fs.existsSync(path.resolve(__dirname, 'config.json'))) {
      const err = new Error('Please configure first with rds --configure');
      err.title = 'Configuration required';
      err.subtitle = 'Run the following on the terminal: rds --configure';
      throw err;
    }

    if (searchTerm === '--cache') {
      return cacheBookmarks().then(() => {
        console.log('Cache successful');
        process.exit(0);
      });
    }

    return searchBookmarks(searchTerm).then((results) => {
      if (isAlfred) {
        return presentAlfredResults(results);
      }
      return presentResults(results, searchTerm);
    });
  })
  .catch((err) => {
    if (isAlfred) {
      console.log(JSON.stringify({ items: [{ title: err.title, subtitle: err.subtitle }] }));
    } else {
      console.error(err.message);
    }
    process.exit(1);
  });
