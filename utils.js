const qs = arg => {
  return document.querySelector(arg)
}

const qsa = arg => {
  return document.querySelectorAll(arg)
}

const qsv = arg => {
  return qs(arg).value
}

const qsi = arg => {
  return parseInt(qsv(arg))
}
