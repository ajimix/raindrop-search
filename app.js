#!/usr/bin/env node

const open = require('open');
const colors = require('colors');
const readline = require('readline');
require('./src/db.js');
const searchBookmarks = require('./src/search-bookmarks.js');
const cacheBookmarks = require('./src/cache-bookmarks.js');

const MAX_RESULTS = 5;
const args = process.argv.slice(2);
let searchTerm = args[0];

function promptSpacing(number) {
  return new Array((number + '').length + 2).join(' ');
}

if (searchTerm === undefined) {
  console.error('Please specify a search term');
  process.exit(1);
}

if (searchTerm === 'rdscache') {
  cacheBookmarks().then(() => {
    console.log('Cache successful');
    process.exit(0);
  });
} else {
  searchBookmarks(searchTerm).then((results) => {
    // console.log(results);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    let resultsPrompt = 'Found the following results:\n';
    let number = 1;

    if (results.length > MAX_RESULTS) {
      console.log(`More than ${MAX_RESULTS} results found, showing first 5`);
      results.splice(MAX_RESULTS, 99999);
    }

    results.forEach((link) => {
      resultsPrompt += `${colors.cyan(number)}. ${colors.green(link.title.substring(0, 30))}\n`;
      resultsPrompt += `${promptSpacing(number)} ${colors.red('>')} ${colors.yellow(link.link.substring(0, 30))}\n`;
      if (link.tags.length > 0) {
        resultsPrompt += `${promptSpacing(number)} ${colors.red('#')} ${colors.blue(link.tags)}\n`;
      }
      resultsPrompt += '\n';
      number++;
    });

    resultsPrompt += `${colors.inverse('Type number (q to exit)')} `;

    rl.question(resultsPrompt, (option) => {
      if (option === 'q') {
        process.exit(0);
      }
      option = option * 1;
      if (isNaN(option) || option > results.length || option < 1) {
        console.log('Invalid option');
        process.exit(0);
      }
      const linkToOpen = results[option - 1];
      open(linkToOpen.link);
      process.exit(0);
    });
  });
}
