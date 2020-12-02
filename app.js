#!/usr/bin/env node

require('./src/db.js');
const { searchBookmarks, presentResults } = require('./src/search-bookmarks.js');
const cacheBookmarks = require('./src/cache-bookmarks.js');

const API_PARALLEL = 4; // How many parallel requests to do to the API. Keep it low.

const args = process.argv.slice(2);
let searchTerm = args.join(' ').trim();

if (searchTerm === undefined) {
  console.error('Please specify a search term');
  process.exit(1);
}

if (searchTerm === '--cache') {
  cacheBookmarks({ parallel: API_PARALLEL }).then(() => {
    console.log('Cache successful');
    process.exit(0);
  });
} else {
  searchBookmarks(searchTerm)
    .then((results) => presentResults(results, searchTerm))
    .catch((err) => {
      console.error(err);
    });
}
