/**
 * @typedef {
 *   (
 *     onfulfilled?: ((value: any) => any) | undefined | null,
 *     onrejected?: ((reason: any) => any) | undefined | null
 *   ) => {then: ThenMethod}
 * } ThenMethod
 */

/**
 * @returns {{
 *   then: ThenMethod,
 *   resolve: (any) => void,
 *   reject: (any) => void
 * }}
 */
function Thenable() {
  let state = 0 // 0=pending, 1=fulfilled, -1=rejected
  let queue = []
  let value
  let scheduled = 0
  let completeCalled = 0

  function then(onResolve, onReject) {
    const nextThenable = Thenable()

    function handleNext() {
      const cb = state > 0 ? onResolve : onReject
      if (isFn(cb)) {
        try {
          const result = cb(value)
          if (result === nextThenable) {
            recursiveError()
          }
          const resultThen = getThenableThen(result)
          if (resultThen) {
            resultThen.call(result, nextThenable.resolve, nextThenable.reject)
          } else {
            nextThenable.resolve(result)
          }
        } catch (err) {
          nextThenable.reject(err)
        }
      } else {
        nextThenable[state > 0 ? 'resolve' : 'reject'](value)
      }
    }

    queue.push(handleNext)
    if (state) {
      scheduleQueueFlush()
    }
    return nextThenable
  }

  const resolve = oneTime(val => {
    if (!completeCalled) {
      complete(1, val)
    }
  })

  const reject = oneTime(reason => {
    if (!completeCalled) {
      complete(-1, reason)
    }
  })

  function complete(st, val) {
    completeCalled++
    let ignoreThrow = 0
    try {
      if (val === thenableObj) {
        recursiveError()
      }
      const valThen = st > 0 && getThenableThen(val)
      if (valThen) {
        valThen.call(val, oneTime(v => {
          ignoreThrow++
          complete(1, v)
        }), oneTime(v => {
          ignoreThrow++
          complete(-1, v)
        }))
      } else {
        state = st
        value = val
        scheduleQueueFlush()
      }
    } catch(e) {
      if (!state && !ignoreThrow) {
        complete(-1, e)
      }
    }
  }

  function scheduleQueueFlush() {
    if (!scheduled) {
      setTimeout(flushQueue, 0) //TODO setImmediate or postMessage approach if available?
      scheduled = 1
    }
  }

  function flushQueue() {
    const q = queue
    scheduled = 0
    queue = []
    q.forEach(callIt)
  }

  function callIt(fn) {
    fn()
  }

  function getThenableThen(val) {
    const valThen = val && (isFn(val) || typeof val === 'object') && val.then
    return isFn(valThen) && valThen
  }

  function oneTime(fn) {
    let called = 0
    return function(...args) {
      if (!called++) {
        fn.apply(this, args)
      }
    }
  }

  function recursiveError() {
    throw new TypeError('Chaining cycle detected')
  }

  const isFn = v => typeof v === 'function'

  const thenableObj = {
    then,
    resolve,
    reject
  }
  return thenableObj
}

/**
 * Promise.all():
 */
Thenable.all = function(items) {
  let resultCount = 0
  let results = []
  let out = Thenable()
  if (items.length === 0) {
    out.resolve([])
  } else {
    items.forEach((item, i) => {
      let itemThenable = Thenable()
      itemThenable.resolve(item)
      itemThenable.then(res => {
        resultCount++
        results[i] = res
        if (resultCount === items.length) {
          out.resolve(results)
        }
      }, out.reject)
    })
  }
  return out
}

export default Thenable
