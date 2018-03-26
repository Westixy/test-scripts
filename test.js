const tryit = () => {
  let money = 100000000000,
    basemoney = money

  let mise = 1
  let tri = 1

  let onLoose = () => {
    tri++
    mise *= 2
  }

  let onWin = () => {
    money += mise * 2
    mise = 1
    tri = 1
  }

  let winrate = 0.495

  let doit = 100

  let max = 0

  for (let i = 0; i < doit; i++) {
    money -= mise
    if (money <= 0) {
      //console.log('loose at ', money)
      max = Math.min(max, money)
      break
    }
    if (Math.random() < winrate) onWin()
    else onLoose()
  }

  return { money, max, delta: money - basemoney }
}

let diff = 0
let loose = 0
let times = 1000000000
let initMoney = 1000000000000
let fullMoney = initMoney
const CHF = nbr => (nbr / 1000000000).toFixed(2)
for (let i = 0; i < times; i++) {
  if (i % (times / 1000) === 0) console.log((i / (times / 100)).toFixed(1), '%')
  const { delta } = tryit()
  if (delta <= 0) loose++
  fullMoney += delta
  if (fullMoney <= 0) console.error('LOOSE : fullMoney : ', fullMoney)
  diff += delta
}
console.log(`Intitial
Money : ${CHF(initMoney)} CHF
Times : ${times}
initMise : ${1 / 1000000000} CHF

Result
Win : ${CHF(diff)} CHF
Win rate : ${diff * 100 / initMoney}%
Money : ${CHF(fullMoney)} CHF
Loose  rate : ${loose * 100 / times}%`)
