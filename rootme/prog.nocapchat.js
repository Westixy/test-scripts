let imgs = document.querySelectorAll('img')
let script = document.createElement('script')
script.src='http://antimatter15.com/ocrad.js/ocrad.js'
document.body.appendChild(script)
setTimeout(()=>{
  let input = document.getElementsByName('cametu')[0]
  input.value = OCRAD(imgs[imgs.length-1])
  document.forms[0].submit()
},1000)
