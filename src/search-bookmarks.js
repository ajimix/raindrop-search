const open = require('open');
const colors = require('colors');
const readline = require('readline');
const db = require('./db.js');

const MAX_RESULTS = 8; // How many results to display.

function promptSpacing(number) {
  return new Array((number + '').length + 2).join(' ');
}

function cropText(text, length) {
  if (text.length < length) {
    return text;
  }
  return text.substring(0, length) + '...';
}

async function searchBookmarks(searchTerm) {
  // Wait for db connection to be done.
  while (db.client === undefined) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  return db.client
    .all('SELECT * FROM bookmarks_cache WHERE title LIKE ? OR tags LIKE ?', `%${searchTerm}%`, `%${searchTerm}%`)
    .catch((err) => {
      if (err.code === 'SQLITE_ERROR' && err.message.indexOf('no such table: bookmarks_cache') > -1) {
        throw new Error('Looks like you haven executed rds rdscache');
      } else {
        throw err;
      }
    });
}

function presentResults(results, searchTerm) {
  // console.log(results);
  if (results.length === 0) {
    return console.log(`No results found for search "${searchTerm}"`);
  }
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

  // Build the output.
  results.forEach((link) => {
    // Link title
    resultsPrompt += `${colors.cyan(number)}. ${colors.green(cropText(link.title, 80))}\n`;
    // Link url
    resultsPrompt += `${promptSpacing(number)} ${colors.red('>')} ${colors.yellow(cropText(link.link, 80))}\n`;
    // Link tags
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
}

module.exports = {
  searchBookmarks,
  presentResults,
};
