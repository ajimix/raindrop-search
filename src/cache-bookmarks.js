const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const db = require('./db.js');
const links = [];
let processFinished = false;
let config;

/**
 * Helper function to scape SQL charaters.
 * @param {string} str
 */
function sqlEscape(str) {
  if (undefined === str) {
    return '';
  }
  if (typeof str != 'string') {
    return str;
  }
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\%]/g, function (char) {
    switch (char) {
      case '\0':
        return '\\0';
      case '\x08':
        return '\\b';
      case '\x09':
        return '\\t';
      case '\x1a':
        return '\\z';
      case '\n':
        return '\\n';
      case '\r':
        return '\\r';
      case '"':
      case "'":
      case '\\':
      case '%':
        return `\${char}`;
    }
  });
}

/**
 * Makes a call to the Raindrop API.
 * @param {string} endpoint
 * @param {object} [options] Additional options to send to the HTTP call.
 */
function fetchRaindrop(endpoint, options) {
  return fetch(
    `https://api.raindrop.io/rest/v1${endpoint}`,
    Object.assign(
      {
        headers: {
          Authorization: `Bearer ${config.token}`,
        },
      },
      options
    )
  );
}

/**
 * Fetches a single page of links from the Raindrop API.
 * @param {number} page Page to fetch.
 */
function fetchPage(page) {
  console.log(`Fetching Raindrop links page ${page + 1}`);
  return fetchRaindrop(`/raindrops/0?perpage=50&page=${page}`, config).then(async (res) => {
    if (res.status !== 200) {
      throw Error(`Invalid Raindrop response ${res.status}`);
    }

    const json = await res.json();
    if (json.items.length === 0) {
      processFinished = true;
      return Promise.resolve();
    }
    links.push.apply(links, json.items);
    return Promise.resolve();
  });
}

/**
 * Fetches pages from the Raindrop API
 * @returns {Promise}
 */
async function fetchPages() {
  await db.client.run('DROP TABLE IF EXISTS bookmarks_cache');
  await db.client.run(`CREATE TABLE bookmarks_cache (
    id unsigned int NOT NULL,
    link text,
    title text,
    tags text,
    PRIMARY KEY (id)
  );`);

  let page = 0;
  do {
    const promises = [];
    for (let i = 0; i < config.cacheParallel; i++) {
      promises.push(fetchPage(page, config));
      page++;
    }
    await Promise.all(promises);
  } while (!processFinished);
  return Promise.resolve();
}

/**
 * Main start function for caching.
 * @returns {Promise}
 */
function start() {
  // Load the config now.
  config = require('../config.json');
  return fetchPages()
    .then(async () => {
      if (links.length === 0) {
        return Promise.resolve();
      }
      // This SQL query should be migrate to bindings in the future.
      let sqlQuery = 'INSERT INTO bookmarks_cache (id, link, title, tags) VALUES';
      links.forEach((link) => {
        sqlQuery += ` (${sqlEscape(link._id)}, '${sqlEscape(link.link)}', '${sqlEscape(link.title)}', '${sqlEscape(
          link.tags.join(',')
        )}'),`;
      });
      sqlQuery = sqlQuery.substring(0, sqlQuery.length - 1);
      return db.client.run(sqlQuery);
    })
    .then((results) => {
      if (results.changes !== links.length) {
        throw Error('Something wrong happened when caching links');
      }
      console.log(`The cache now contains ${results.changes} links`);
      return Promise.resolve();
    })
    .catch(console.error)
    .finally(() => {
      db.client.db.close();
    });
}

module.exports = start;
