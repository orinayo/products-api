// Figure out what set of credentials to return
if (process.env.NODE_ENV === 'production') {
  // Return the prod set of keys
  module.exports = require('./prod')
} else if (process.env.NODE_ENV === 'test') {
  // Return the test set of keys
  module.exports = require('./test')
} else {
  // Return the dev set of keys
  module.exports = require('./dev')
}
