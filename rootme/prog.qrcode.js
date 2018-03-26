let scripts = ["https://cozmo.github.io/jsQR/jsQR.js"];
let bscr = scripts.map(s => {
  let b = document.createElement("script");
  b.src = s
  return b
})
bscr.forEach(b=>document.body.appendChild(b))
let cnv = document.createElement('canvas')
cnv.style.border = '1px solid red'
cnv.width=300
cnv.height=300
let c = cnv.getContext('2d')
document.body.appendChild(cnv)
let imgs = document.querySelectorAll('img')
let img = imgs[imgs.length-1]
c.drawImage(img,0,0)
let da = {
  b:9,
  n1:7,
  n2:5,
  n3:3,
}
const drawAngle=(c,x,y)=>{
  c.fillStyle='black'
  c.fillRect(x,y,da.b*da.n1,da.b*da.n1)
  c.fillStyle='white'
  c.fillRect(x+da.b,y+da.b,da.n2*da.b,da.n2*da.b)
  c.fillStyle='black'
  c.fillRect(x+da.b*2,y+da.b*2,da.n3*da.b,da.n3*da.b)
}
drawAngle(c,18,18)
drawAngle(c,219,18)
drawAngle(c,18,219)

setTimeout(()=>{
  let b = c.getImageData(18,18,300-18*2,300-18*2)
  let v = jsQR(b.data,b.width,b.height).data.replace('The key is ','')

  document.body.getElementsByTagName('input')[0].value=v
  document.forms[0].submit()
},500)