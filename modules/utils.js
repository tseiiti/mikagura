export const qs = arg => {
  return document.querySelector(arg)
}

export const qsa = arg => {
  return document.querySelectorAll(arg)
}

export const qsv = arg => {
  return qs(arg).value
}

export const qsi = arg => {
  return parseInt(qsv(arg))
}
