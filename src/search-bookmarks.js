const db = require('./db.js');

async function searchBookmarks(searchTerm) {
  // Wait for db connection to be done.
  while (db.client === undefined) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  return db.client
    .all('SELECT * FROM bookmarks_cache WHERE title LIKE ? OR tags LIKE ?', `%${searchTerm}%`, `%${searchTerm}%`)
    .catch((err) => {
      console.error(err);
    });
}

module.exports = searchBookmarks;
