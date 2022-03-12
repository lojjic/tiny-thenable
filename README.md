# thenable-js

This is a lightweight [thenable](https://promisesaplus.com/#point-7) implementation in JavaScript. It is entirely self-contained within a single function with no external dependencies, so it can be easily serialized to a web worker, for example. 

This implementation conforms fully to the [Promises/A+ spec](https://github.com/promises-aplus/promises-spec), so it can safely interoperate with other thenable implementations. 

*However*, it is _not_ a full implementation of ES2015 Promises, e.g. it does not have the same constructor signature and does not expose a `catch` method or the static `resolve`/`reject`/`all`/`race` initializer methods. If you need to hand a Thenable instance off to consuming code that may expect a true Promise, you'll want to wrap it in a native-or-polyfilled Promise first.

> Why yet another Promises/A+ implementation? Great question. We needed a polyfill-like thing that was (a) wrapped in a single function for easy serialization across to a Worker, and (b) was as small as possible -- at ~900B minified (~500B gzipped) this is the smallest implementation I found at the time. And also, exercises like this are challenging and fun!

This began as a utility in [troika-worker-utils](https://github.com/protectwise/troika/tree/main/packages/troika-worker-utils) as a way to use `Promise`-like objects in web workers where the browser may not have a native `Promise` implementation. The browser support landscape changed since such that native Promises can now be used reliably in that project, so this JS implementation has been extracted and placed here for posterity and for anyone else who might need such a thing.

## Usage

```sh
npm install thenable-js
```

```js
import Thenable from 'thenable-js'

const myThenable = Thenable()

myThenable.then(
  result => {
    console.log('Got result: ' + result)
  },
  error => {
    console.error(error)
  }
)

myThenable.resolve('OK!')

// or: myThenable.reject(new Error('Oopsie!'))

```

Since it has a `then()` method, it should be usable as 

There's also a `Thenable.all([...thenables])` utility function that behaves like `Promise.all()`.
