const promisesAplusTests = require('promises-aplus-tests')
import Thenable  from '../src/Thenable.js'

// simple bridge from mocha `specify` to jest's equivalent
global.specify = test

/**
 * Compliance tests for BespokeThenable
 * We use the `promises-aplus-tests` suite to run a full Promises/A+ compliance test
 */
promisesAplusTests.mocha({
  deferred() {
    const thenable = new Thenable()
    return {
      promise: thenable,
      resolve: thenable.resolve,
      reject: thenable.reject
    }
  }
})
