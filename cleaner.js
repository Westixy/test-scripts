const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')
const os = require('os')
const command = require('commander')
const csv = require('csv')
const util = require('util')

command
  .version('0.0.1')
  .option('-i, --input <file>', 'path to original csv')
  .option('-o, --output <file>', 'path to output file')
  .parse(process.argv)

const parse = util.promisify(csv.parse)

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

const cleanfield = field => {
  let techs = []
  field.split(',').forEach(e =>
    e.split('/').forEach(e =>
      e.split(' ').forEach(e => {
        e = e.trim().toLowerCase()
        const rx = [
          /framework( (php|js))/i,
          /\…|\(|\)|\:|\.|\d/gi,
          'd’',
          /^(est|et|un|ou|apiautres|plus|google|business|view|analyse|open|microsoft|twitter|instagram|social|framework|framwork|apple|autres|continue|ms)$/i,
        ]
        rx.forEach(r => (e = e.replace(r, '')))
        e = e.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        e = e.replace(/^(.+)js$/, x => x.substring(0, x.length - 2))

        const groups = [
          ['js', 'javascript'],
          ['rest', 'restfull', 'restful', 'restfu'],
          ['asp', 'net', 'aspnet', 'vbnet'],
          ['c#', 'c#net'],
          ['tests', 'unitaires', 'phpunit'],
          ['api', 'webapi', 'apis'],
          ['jquery', 'jq'],
        ]

        groups.forEach(g => {
          if (g.includes(e)) e = g[0]
        })

        if (e !== '') techs.push(e)
      })
    )
  )
  return techs
}

const doit = async () => {
  const file = await fs.readFile(command.input)
  const parsed = await parse(file.toString(), { columns: true })
  let techs = []
  parsed.forEach(e => {
    e._techs = cleanfield(e.Technologies)
    e._techs.forEach(e => techs.push(e))
  })
  let techx = {}
  techs.forEach(e => (techx[e] = 0))
  techx = Object.keys(techx)

  prompt({ p: parsed, c: compx, x: techx })
}
doit().catch(console.error)
