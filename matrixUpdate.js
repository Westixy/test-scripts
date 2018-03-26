const next = [[10, 20, 30], [40, 50, 60], [70, 80, 90]]
const origin = [
  [90, 80, 70, 10],
  [60, 50, 40, 20],
  [30, 20, 10, 30],
  [100, 110, 120, 40],
]

const state = [0, 0.25, 0.5, 0.75, 1]

let base = next
let change = origin
let isNormal = true

if (base.length < change.length) {
  ;[base, change] = [change, base]
  isNormal = false
}

state.forEach(x => {
  console.log(
    x.toFixed(2),
    origin.map((row, ri) => {
      return row.map((cell, ci) => {
        let cellChange = 0
        let cellbase = cell
        if (next[ri] && next[ri][ci]) cellChange = next[ri][ci]
        if (!isNormal) {
          cellbase = cellChange
          cellChange = cell
        }
        return Math.round(cellbase + x * (cellChange - cellbase))
      })
    })
  )
})
