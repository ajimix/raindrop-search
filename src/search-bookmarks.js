const db = require('./db.js');

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

module.exports = searchBookmarks;
