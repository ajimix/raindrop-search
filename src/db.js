const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const debug = false;

let client;

if (debug) {
  sqlite3.verbose();
}

open({
  filename: path.resolve(__filename, '../../database.db'),
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
};
