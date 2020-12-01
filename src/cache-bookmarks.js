const fetch = require('node-fetch');
const db = require('./db.js');
const links = [];
let currentPage = 0;

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

function fetchRaindrop(endpoint, options) {
  return fetch(
    `https://api.raindrop.io/rest/v1${endpoint}`,
    Object.assign(
      {
        headers: {
          Authorization: 'Bearer 319fd379-f07e-4f2b-9f75-1b1b005725aa',
        },
      },
      options
    )
  );
}

function fetchPages() {
  console.log(`Fetching Raindrop links page ${currentPage}`);
  return fetchRaindrop(`/raindrops/0?perpage=50&page=${currentPage}`).then(async (res) => {
    if (res.status !== 200) {
      throw Error(`Invalid Raindrop response ${res.status}`);
    }
    if (db.client === undefined) {
      console.log('Database is not ready, waiting.');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (currentPage === 0) {
      await db.client.db.exec('DROP TABLE IF EXISTS bookmarks_cache');
      await db.client.db.exec(`CREATE TABLE bookmarks_cache (
        id unsigned int NOT NULL,
        link text,
        title text,
        tags text,
        PRIMARY KEY (id)
      );`);
    }

    const json = await res.json();
    if (json.items.length === 0) {
      return Promise.resolve(links);
    }
    links.push.apply(links, json.items);
    currentPage++;
    return Promise.resolve(links);
    // return fetchPages();
  });
}

function start() {
  return fetchPages()
    .then(async (links) => {
      if (links.length === 0) {
        return Promise.resolve();
      }
      let sqlQuery = 'INSERT INTO bookmarks_cache (id, link, title, tags) VALUES';
      links.forEach((link) => {
        // console.log(link);
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
      return Promise.resolve();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      db.client.db.close();
    });
}

module.exports = start;
