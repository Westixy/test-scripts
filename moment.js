const m = require('moment')
const inquirer = require('inquirer')
let a = m(0)
console.log(
  a
    .add({
      h: 2,
      m: 35,
    })
    .add({
      h: 1,
      m: 40,
    })
    .add({
      h: 0,
      m: 52,
    })
    .add({
      h: 6,
      m: 32,
    })
    .format('HH:mm:ss')
)

function prompt(c) {
  let p = inquirer.prompt
  p({
    message: '>',
    type: 'input',
    name: 'res',
  })
    .then(({ res }) => {
      if (res.trim() === 'exit') process.exit()
      console.log(eval(res))
      prompt(c)
    })
    .catch(e => {
      console.error(e)
      prompt(c)
    })
}
prompt({})
