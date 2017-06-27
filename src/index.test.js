import {
  Just,
  Nothing,
  isMaybe,
  isJust,
  isNothing,
  toBoolean,
  bind,
  scope,
} from './index'

const VALUE = 10

const assert = (msg, a, b) =>
  test(msg, () => expect(a).toEqual(b))

const assertCalledWith = (name, fn, ...args) => {
  test(`mock[${ name }] called`, () => expect(fn).toHaveBeenCalled())
  test(`mock[${ name }] called with`, () => expect(fn).toHaveBeenCalledWith(...args))
}

const assertNotCalled = (name, fn) =>
  test(`mock[${ name }] not called`, () => expect(fn).not.toHaveBeenCalled())


const assertJust = (maybe, value) => {
  assert('isMaybe(maybe)    -> true',  isMaybe(maybe),    true)
  assert('isJust(maybe)     -> true',  isJust(maybe),     true)
  assert('isNothing(maybe)  -> false', isNothing(maybe),  false)
  assert('toBoolean(maybe)  -> true',  toBoolean(maybe),  true)
  assert('maybe.isMaybe()   -> true',  maybe.isMaybe(),   true)
  assert('maybe.isJust()    -> true',  maybe.isJust(),    true)
  assert('maybe.isNothing() -> false', maybe.isNothing(), false)
  assert('maybe.toBoolean() -> true',  maybe.toBoolean(), true)
  assert('maybe.value       -> value', maybe.value, value)
}

const assertNothing = maybe => {
  assert('isMaybe(maybe)    -> true',  isMaybe(maybe),    true)
  assert('isJust(maybe)     -> false', isJust(maybe),     false)
  assert('isNothing(maybe)  -> true',  isNothing(maybe),  true)
  assert('toBoolean(maybe)  -> false', toBoolean(maybe),  false)
  assert('maybe.isMaybe()   -> true',  maybe.isMaybe(),   true)
  assert('maybe.isJust()    -> false', maybe.isJust(),    false)
  assert('maybe.isNothing() -> true',  maybe.isNothing(), true)
  assert('maybe.toBoolean() -> false', maybe.toBoolean(), false)
  assert('maybe.value       -> undefined', maybe.value, undefined)
}

describe('new Just', () => assertJust(new Just(VALUE), VALUE))
describe('Just',     () => assertJust(    Just(VALUE), VALUE))

describe('new Nothing', () => assertNothing(new Nothing()))
describe('Nothing',     () => assertNothing(    Nothing()))

describe('bind', () => {
  describe('[] -> value -> Just value', () => {
    const maybe = bind([])(VALUE)
    assertJust(maybe, VALUE)
  })

  describe('[] -> Just value -> Just value', () => {
    const maybe = bind([])(VALUE)
    assertJust(maybe, VALUE)
  })

  describe('[] -> Nothing -> Nothing', () => {
    const maybe = bind([])(Nothing())
    assertNothing(maybe)
  })

  describe('[just] -> value -> Just value', () => {
    const maybe = bind([
      a => Just(a + 1),
    ])(VALUE)
    assertJust(maybe, VALUE + 1)
  })

  describe('[just, just, just] -> value -> Just value', () => {
    const fn1 = jest.fn().mockImplementation(a => Just(a + 1))
    const fn2 = jest.fn().mockImplementation(a => Just(a + 1))
    const fn3 = jest.fn().mockImplementation(a => Just(a + 1))
    const maybe = bind([fn1, fn2, fn3])(VALUE)

    assertCalledWith('fn1', fn1, VALUE)
    assertCalledWith('fn2', fn2, VALUE + 1)
    assertCalledWith('fn3', fn3, VALUE + 2)

    assertJust(maybe, VALUE + 3)
  })

  describe('[just, just, Nothing] -> value -> Nothing', () => {
    const fn1 = jest.fn().mockImplementation(a => Just(a + 1))
    const fn2 = jest.fn().mockImplementation(a => Just(a + 1))
    const fn3 = jest.fn().mockImplementation(a => Nothing())
    const maybe = bind([fn1, fn2, fn3])(VALUE)

    assertCalledWith('fn1', fn1, VALUE)
    assertCalledWith('fn2', fn2, VALUE + 1)
    assertCalledWith('fn3', fn3, VALUE + 2)

    assertNothing(maybe)
  })

  describe('[Nothing, just, just] -> value -> Nothing', () => {
    const fn1 = jest.fn().mockImplementation(a => Nothing())
    const fn2 = jest.fn().mockImplementation(a => Just(a + 1))
    const fn3 = jest.fn().mockImplementation(a => Just(a + 1))
    const maybe = bind([fn1, fn2, fn3])(VALUE)

    assertCalledWith('fn1', fn1, VALUE)
    assertNotCalled('fn2', fn2)
    assertNotCalled('fn3', fn3)

    assertNothing(maybe)
  })


})

describe('scope', () => {
  const isNum = v => typeof v === 'number' ? Just(v) : Nothing()
  const gte = n => v => v >= n ? Just(v) : Nothing()
  const lte = n => v => v <= n ? Just(v) : Nothing()
  const add = n => v => Just(v + n)

  const pipe = bind([
    scope('a', [ isNum, gte(5),  lte(15), add(1) ]),
    scope('b', [ isNum, gte(15), lte(25), add(1) ]),
    scope('c', [ isNum, gte(25), lte(35), add(1) ]),
  ])

  describe('{ a:10, b:20, c:30 }', () => {
    assertJust(pipe({ a:10, b:20, c:30 }), { a:11, b:21, c:31 })
  })

  describe('{ a:10, b:20, c:30, d:"lol" }', () => {
    const maybe = pipe({ a:10, b:20, c:30, d:"lol" })
    assertJust(maybe, { a:11, b:21, c:31, d:"lol" })
    test('d is defined', () => expect(maybe.value.d).toBeDefined())
    test('d:"lol"', () => expect(maybe.value.d).toEqual("lol"))
  })

  describe('100', () => {
    assertNothing(pipe(100))
  })

  describe('{ a:10, b:20, c:"lol" }', () => {
    assertNothing(pipe({ a:10, b:20, c:"lol" }))
  })

  describe('{ a:20, b:20, c:30 }', () => {
    assertNothing(pipe({ a:20, b:20, c:30 }))
  })
})
