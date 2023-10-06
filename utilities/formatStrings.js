import { startCase } from "lodash";
import { pluralsMap } from './constants'

export function pluralize(word, quantity, options) {
  const {capitalize} = options || {}
  let result
  if (quantity !== 1) {
    if (pluralsMap[word]) {
      result = pluralsMap[word]
    } else {
      result = `${word}s`
    }
  } else {
    result = word
  }
  if (capitalize) {
    result = startCase(result)
  }
  return result
}