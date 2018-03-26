const dict = '0123456789abcdefghijklmnopqrstuvwxyz'

const nbr = 15000

const generatedPass = []

const generatePass = numb => {
  let j = numb
  let pass = ''
  do {
    let modulo = j % dict.length
    pass = dict.charAt(modulo) + pass
    j = (j - modulo) / dict.length
  } while (j > 0)
  return pass
}

const foreach = (act, { min = 1, max = 5 } = {}) => {
  min = Math.pow(dict.length, min - 1)
  max = Math.pow(dict.length, max)
  const tot = max - min
  let data = { i: 0, pass: '' }
  let interval = setInterval(
    () =>
      console.log(
        (data.i / tot * 100).toFixed(2),
        '% ',
        min + data.i,
        data.pass
      ),
    1
  )
  if (tot <= 0) throw Error(`Nawak le min max la, remplis ca correct`)
  for (let i = 0; i < tot; i++) {
    const pass = generatePass(min + i)
    data = {
      passid: min + i,
      pass,
      i,
      min,
      max,
      tot,
    }
    act(data)
  }
  clearInterval(interval)
}
setInterval(() => console.log(new Date()), 1000)
foreach(a => console.debug(a.pass), { min: 4, max: 6 })
//const interval = setInterval(()=>{
//}, 200)
/*
fetch("Yoann/Yoann.php", {
  method: "POST",
  body: new FormData().append("pass", "sss")
})
  .then(res => res.text().then(txt => {

  }))
  .then(console.log);
*/
