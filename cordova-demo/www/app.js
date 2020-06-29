/* for prettier-standard --lint (eslint): */
/* global cordova */

document.addEventListener('deviceready', onReady)

// based on some JavaScript code generated by generate-cordova-package
function log (text) {
  // log into the `messages` div:
  document.getElementById('messages').appendChild(document.createTextNode(text))
  document.getElementById('messages').appendChild(document.createElement('br'))
  // and to the console
  console.log(text)
}

const DATABASE_FILE_NAME = 'demo.db'

// SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE
// ref: https://www.sqlite.org/c3ref/open.html
const OPEN_DATABASE_FILE_FLAGS = 6

function openMemoryDatabaseConnection (openCallback, errorCallback) {
  window.sqliteBatchConnection.openDatabaseConnection(
    { fullName: ':memory:', flags: 2 },
    openCallback,
    errorCallback
  )
}

const CORRECT_KEY = 'correct'

function openFileDatabaseConnectionWithKey (
  name,
  key,
  openCallback,
  errorCallback
) {
  window.sqliteStorageFile.resolveAbsolutePath(
    {
      name: name,
      // TEMPORARY & DEPRECATED value, as needed for iOS & macOS ("osx"):
      location: 2
    },
    function (path) {
      log('database file path: ' + path)

      window.sqliteBatchConnection.openDatabaseConnection(
        { fullName: path, flags: OPEN_DATABASE_FILE_FLAGS, key: key },
        openCallback,
        errorCallback
      )
    }
  )
}

// (with no password key)
function openCacheFileDatabaseConnection (name, openCallback, errorCallback) {
  window.resolveLocalFileSystemURL(
    // portable across Android, iOS, & macOS ("osx"):
    cordova.file.cacheDirectory,
    function (entry) {
      const dataDirectoryUrl = entry.toURL()

      log('data directory url: ' + dataDirectoryUrl)

      // hacky, working solution:
      const path = dataDirectoryUrl.substring(7) + name

      log('database cache file path: ' + path)

      window.sqliteBatchConnection.openDatabaseConnection(
        { fullName: path, flags: OPEN_DATABASE_FILE_FLAGS },
        openCallback,
        errorCallback
      )
    }
  )
}

function onReady () {
  log('deviceready event received')
  showSQLiteVersion()
}

function showSQLiteVersion () {
  openMemoryDatabaseConnection(
    function (id) {
      log('memory database connection id: ' + id)

      window.sqliteBatchConnection.executeBatch(
        id,
        [['SELECT SQLITE_VERSION()', []]],
        function (results) {
          log(JSON.stringify(results))
          startMemoryDatabaseDemo()
        }
      )
    },
    function (error) {
      log('UNEXPECTED OPEN DATABASE ERROR: ' + error)
    }
  )
}

function startMemoryDatabaseDemo () {
  openMemoryDatabaseConnection(
    function (id) {
      log('memory database connection id: ' + id)

      window.sqliteBatchConnection.executeBatch(
        id,
        [['SELECT UPPER(?)', ['Text']]],
        function (results) {
          log(JSON.stringify(results))
          startFileDatabaseDemo()
        }
      )
    },
    function (error) {
      log('UNEXPECTED OPEN MEMORY DATABASE ERROR: ' + error)
    }
  )
}

function startFileDatabaseDemo () {
  openFileDatabaseConnectionWithKey(
    DATABASE_FILE_NAME,
    CORRECT_KEY,
    openDatabaseFileCallback,
    function (e) {
      log('UNEXPECTED OPEN ERROR: ' + e)
    }
  )
}

function openDatabaseFileCallback (connectionId) {
  log('open connection id: ' + connectionId)

  // ERROR TEST - file name with incorrect flags:
  window.sqliteBatchConnection.openDatabaseConnection(
    // (with no password key)
    { fullName: 'dummy.db', flags: 0 },
    function (_ignored) {
      log('FAILURE - unexpected open success callback received')
    },
    function (e) {
      log('OK - received error callback as expected for incorrect open call')

      // CONTINUE with batch demo, with the correct connectionId:
      batchDemo(connectionId)
    }
  )
}

function batchDemo (connectionId) {
  log('starting batch demo for connection id: ' + connectionId)
  window.sqliteBatchConnection.executeBatch(
    connectionId,
    [
      [
        'SELECT ?, -?, LOWER(?), UPPER(?)',
        [null, 1234567.890123, 'ABC', 'Text']
      ],
      ['SELECT -?', [1234567890123456]], // should fit into 52 bits (signed)
      ['SLCT 1', []],
      ['SELECT ?', ['OK', 'out of bounds parameter']],
      ['DROP TABLE IF EXISTS Testing', []],
      ['CREATE TABLE Testing (data NOT NULL)', []],
      ["INSERT INTO Testing VALUES ('test data')", []],
      ['INSERT INTO Testing VALUES (null)', []],
      ['DELETE FROM Testing', []],
      ["INSERT INTO Testing VALUES ('test data 2')", []],
      ["INSERT INTO Testing VALUES ('test data 3')", []],
      ['SELECT * FROM Testing', []],
      ["SELECT 'xyz'", []]
    ],
    batchCallback
  )
}

function batchCallback (batchResults) {
  // show batch results in JSON string format (on all platforms)
  log('received batch results')
  log(JSON.stringify(batchResults))

  startReaderDemoWithWrongKey()
}

function startReaderDemoWithWrongKey () {
  openFileDatabaseConnectionWithKey(
    DATABASE_FILE_NAME,
    'wrong password',
    function (id) {
      // This could happen with SQLCipher
      log('connection id with wrong password key: ' + id)
      // not expected to work with wrong password key:
      window.sqliteBatchConnection.executeBatch(
        id,
        [['SELECT * FROM Testing', []]],
        function (res) {
          log(JSON.stringify(res))
          // continue with another connection id with correct key
          startReaderDemoWithCorrectKey()
        }
      )
    },
    function (e) {
      log('OK - error as expected with wrong password key')
      // continue with another connection id with correct password key
      startReaderDemoWithCorrectKey()
    }
  )
}

function startReaderDemoWithCorrectKey () {
  openFileDatabaseConnectionWithKey(
    DATABASE_FILE_NAME,
    CORRECT_KEY,
    function (id) {
      log('read from another connection id: ' + id)

      window.sqliteBatchConnection.executeBatch(
        id,
        [['SELECT * FROM Testing', []]],
        function (res) {
          log(JSON.stringify(res))
          startCacheFileDemo()
        }
      )
    },
    function (error) {
      log('UNEXPECTED OPEN ERROR: ' + error)
    }
  )
}

// (with no password key)
function startCacheFileDemo () {
  openCacheFileDatabaseConnection(
    DATABASE_FILE_NAME,
    function (id) {
      log('cache file database connection id: ' + id)

      window.sqliteBatchConnection.executeBatch(
        id,
        [
          ['DROP TABLE IF EXISTS Testing', []],
          ['CREATE TABLE Testing (data NOT NULL)', []],
          ["INSERT INTO Testing VALUES ('test data')", []],
          ['SELECT * FROM Testing', []]
        ],
        function (results) {
          log(JSON.stringify(results))
          u0000Character()
        }
      )
    },
    function (error) {
      log('UNEXPECTED OPEN ERROR: ' + error)
    }
  )
}

function u0000Character () {
  openMemoryDatabaseConnection(
    function (id) {
      log('memory database connection id for u0000 character: ' + id)

      window.sqliteBatchConnection.executeBatch(
        id,
        [['SELECT HEX(?)', ['abc\u0001\u0000def']]],
        function (results) {
          log(JSON.stringify(results))
        }
      )
    },
    function (error) {
      log('UNEXPECTED OPEN ERROR: ' + error)
    }
  )
}
