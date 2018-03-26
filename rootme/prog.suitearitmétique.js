let raw = document.body.textContent
let url = 'http://challenge01.root-me.org/programmation/ch1/ep1_v.php?result='
raw = raw.split('\n')
let match = [
  raw[0].match(/(-?\d{1,2})|(\]\ ([+-])\ \[)/g),
  raw[1].match(/(-?\d{1,4})/g),
  raw[2].match(/U(\d+)Y/),
]
let nums = {
  a: Number(match[0][1]),
  b: Number(match[0][3]),
  n: 0,
  o: match[0][2] === '] + [' ? 1 : -1,
  u: Number(match[1][1]),
  _: Number(match[2][1]),
}
console.log(nums)
while (nums.n < nums._) {
  nums.u = nums.a + nums.u + nums.o * (nums.n * nums.b)
  nums.n++
  if (nums.n <= 5) console.log('U_' + nums.n + '=' + nums.u)
}
console.log('U_' + nums.n + '=' + nums.u)
window.location.href = url + String(nums.u)
/**
fetch(url + String(nums.u), {
  method: 'GET',
  headers:{
    cookie:document.cookie
  }
})
  .then(a => a.text())
  .then(a => {
    //if (a === 'You must retrieve the first page!') window.location.reload()
    //else alert(a)
    console.log('U_' + nums.n + '=' + nums.u + ' -> ' + a)
  })
console.log(nums)
*/