const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const debug = false;

let client;

/**
 * The database loads on file load, so we just wait for client to have some value.
 * @returns {Promise<dbClient>}
 */
async function loadDb() {
  while (client === undefined) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  return Promise.resolve(client);
}

if (debug) {
  sqlite3.verbose();
}

open({
  filename: path.resolve(__dirname, '../database.db'),
  driver: sqlite3.cached.Database,
})
  .then((db) => {
    client = db;
    if (debug) {
      db.on('trace', console.log);
    }
  })
  .catch((err) => {
    console.error(err);
  });

module.exports = {
  /**
   * Returns the global client
   * @returns {object} The db client
   */
  get client() {
    return client;
  },
  loadDb,
};
