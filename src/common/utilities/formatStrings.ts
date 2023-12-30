import { startCase } from 'lodash';

import { pluralsMap } from 'src/common/constants.ts';

export function pluralize(
  word: string,
  quantity: number,
  options?: { capitalize?: boolean },
) {
  const { capitalize } = options || {};
  const isMultiple = word.includes(' ');
  let beginningWords;
  let lastWord;
  if (isMultiple) {
    const words = word.split(' ');
    lastWord = words.pop();
    beginningWords = words.join(' ');
  }
  const _word = isMultiple ? lastWord : word;
  let result;
  if (quantity !== 1) {
    if (pluralsMap[_word]) {
      result = pluralsMap[_word];
    } else {
      result = `${_word}s`;
    }
  } else {
    result = _word;
  }
  if (isMultiple) {
    result = `${beginningWords} ${result}`;
  }
  if (capitalize) {
    result = startCase(result);
  }
  return result;
}

export const exportedForTesting = {
  pluralize,
};
