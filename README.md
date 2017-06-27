# `@orodio/maybe`

[![Build Status](https://travis-ci.org/orodio/gate.svg?branch=master)](https://travis-ci.org/orodio/maybe)

### Install

```
yarn add @orodio/maybe
```

### Use

```
import {
  Just,
  Nothing,
  isJust,
  isNothing,
  bind,
  scope,
} from "@orodio/maybe"

const isNumber = value =>
  typeof value === 'number'
    ? Just(value)
    : Nothing()

const isGreaterThanOrEqualTo = n => value =>
  value >= n
    ? Just(value)
    : Nothing()

const isLessThanOrEqualTo = n => value =>
  value <= n
    ? Just(value)
    : Nothing()

const inRange = (min, max) =>
  bind([
    isNumber,
    isGreaterThanOrEqualTo(min),
    isLessThanOrEqualTo(max),
  ])

const inc = d => value =>
  Just(value + d)

const m1 = inRange(5, 10)(7)
assert(m1.value, 7)
assert(m1.toBoolean(), true)
assert(isJust(m1), true)
assert(isNothing(m1), false)

const m2 = inRange(5, 10)(15)
assert(m2.value, undefined)
assert(m2.toBoolean(), false)
assert(isJust(m2), false)
assert(isNothing(m2), true)

const mx = bind([
  scope('a', [inRange(5,  15), inc(1)]),
  scope('b', [inRange(15, 25), inc(1)]),
  scope('c', [inRange(25, 30), inc(1)]),
])

const m3 = mx({ a:10, b:20, c:30 })
assert(m3.value, { a:11, b:21, c:31 })
assert(m3.toBoolean(), true)
assert(isJust(m3), true)
assert(isNothing(m3), false)

const m4 = mx({ a:1, b:20, c:30 })
assert(m4.value, undefined)
assert(m4.toBoolean(), false)
assert(isJust(m4), false)
assert(isNothing(m4), true)

const m5 = mx({ a:10, b:20, c:"lol" })
assert(m5.value, undefined)
assert(m5.toBoolean(), false)
assert(isJust(m5), false)
assert(isNothing(m5), true)

const m6 = mx("lol")
assert(m6.value, undefined)
assert(m6.toBoolean(), false)
assert(isJust(m6), false)
assert(isNothing(m6), true)

const m7 = mx({ a:10, b:20, c:30, d:"lol" })
assert(m7.value, { a:11, b:21, c:31, d:"lol" })
assert(m7.toBoolean(), true)
assert(isJust(m7), true)
assert(isNothing(m7), false)
```

### Dev

```
$ make               # see make help
$ make help          # shows all the make commands
$ make build         # build stuff puts it in /lib
$ make build-watch   # make build but all the time
$ make test          # tests the stuff
$ make test-watch    # make test but all the time
$ make version       # creates a patch tag
$ make version-minor # creates a minor tag
$ make version-major # creates a major tag
$ make publish       # publishes the module
```
