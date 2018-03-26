const { Client } = require('./ipc')
const inquirer = require('inquirer')

const C = new Client()

C.connect({ name: 'joe' })
  .then(cli => {
    C.registerChannel('test')
    console.log('client started ...')
    prompt({ cli, C })
  })
  .catch(console.error)

function prompt(context) {
  let p = inquirer.prompt
  p({
    message: '>',
    type: 'input',
    name: 'res',
  })
    .then(({ res }) => {
      if (res.trim() === 'exit') process.exit()
      console.log(eval(res))
      prompt(context)
    })
    .catch(e => {
      console.error(e)
      prompt(context)
    })
}
