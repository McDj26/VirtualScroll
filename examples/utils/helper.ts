export function generateRandomLetter() {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 97)
}

export function generateRandomWord(len) {
  len = Math.min(10, len)
  return new Array(len).fill(0).map(generateRandomLetter).join('')
}

export function generateRandomFirstWord() {
  return (
    generateRandomLetter().toUpperCase() +
    generateRandomWord(Math.floor(Math.random() * 10) + 1)
  )
}

export function generateRandomSentence(len) {
  len = Math.min(20, len)
  const start = generateRandomFirstWord() + ' '
  return (
    start +
    (new Array(len)
      .fill(0)
      .map(() => generateRandomWord(Math.floor(Math.random() * 8) + 2))
      .map((str, index) =>
        Math.random() > 0.9 && index !== len - 1 ? str + ',' : str,
      )
      .join(' ') +
      '.')
  )
}

export function lorem(len) {
  len = Math.max(1, len)
  return new Array(len)
    .fill(0)
    .map(() =>
      new Array(Math.floor(Math.random() * 5) + 1)
        .fill(0)
        .map(() => generateRandomSentence(Math.floor(Math.random() * 9) + 1))
        .join(' '),
    )
    .join('\n')
}
