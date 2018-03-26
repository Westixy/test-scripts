const fetch = require('node-fetch')

const url = 'http://test.com/{id}/test{a}/..{asd}ll/some/{s}'

function tradUrl(url) {
  const parsed = url.match(/{[^}]*}/g)
  const args = { _url: url }
  parsed.forEach(el => {
    args[el.substring(1, el.length - 1)] = el
  })
  console.log(args)
}

function redo(traded){
  let url = traded._url
  delete traded._url
  for (let key in traded){
    url.replace(`{${key}}`, traded[key])
  }
}

function controle(tradded){

}

function beforeEach()

tradUrl(url)
