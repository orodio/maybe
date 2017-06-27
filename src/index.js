import "babel-polyfill"

export function Maybe () {}
Maybe.prototype = {
  isMaybe:   function () { return isMaybe(this) },
  isJust:    function () { return isJust(this) },
  isNothing: function () { return isNothing(this) },
  toBoolean: function () { return toBoolean(this) },
}

export function Just (value) {
  if (!isJust(this)) return new Just(value)
  Maybe.call(this)
  this.value = value
}
Just.prototype = Object.create(Maybe.prototype, {})
Just.prototype.constructor = Just

export function Nothing () {
  if (!isNothing(this)) return new Nothing()
  Maybe.call(this)
}
Nothing.prototype = Object.create(Maybe.prototype, {})
Nothing.prototype.constructor = Nothing

export function isMaybe (maybe) {
  return maybe instanceof Maybe
}

export function isJust (maybe) {
  return maybe instanceof Just
}

export function isNothing (maybe) {
  return maybe instanceof Nothing
}

export function toBoolean (maybe) {
  return isJust(maybe)
}

export const _return = maybe =>
  isMaybe(maybe)
    ? maybe
    : Just(maybe)

export const bind = (fns = []) => maybe => {
  maybe = _return(maybe)
  if (!fns.length) return maybe
  if (isNothing(maybe)) return maybe
  const [head, ...tail] = fns
  return bind(tail)(head(maybe.value))
}

export const scope = (key, fns) => maybe => {
  maybe = _return(maybe)
  const obj = maybe.value
  if (Array.isArray(obj) || typeof obj !== 'object') return Nothing()
  const lens = bind(fns)(obj[key])
  if (isNothing(lens)) return Nothing()
  obj[key] = lens.value
  return Just(obj)
}
