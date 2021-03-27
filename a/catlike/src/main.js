import './style.less'

const box = $('<div class="container"></div>')
box.appendTo($(document.body))

// box.on('mousedown', (e) => {
//   e.preventDefault()
//   const { pageX: x, pageY: y } = e
//   $(`<div class="point" style="transform: translate3d(${x}px, ${y}px, 0)"></div>`).appendTo(box)
// })
// box.on('mousemove', (e) => {
//   e.preventDefault()
// })
// box.on('mouseup', (e) => {
//   e.preventDefault()
// })

const canvas = $('<canvas/>').appendTo(box)
const ctx = canvas.get(0).getContext('2d')

canvas.attr('width', box.width())
canvas.attr('height', box.height())

// $(window).on('resize', function () {
//   canvas.attr('width', box.width())
//   canvas.attr('height', box.height())
// })

const mouse = { x: 0, y: 0 }

/* Mouse Capturing Work */
canvas.on('mousemove', function (e) {
  let el = $(this)
  let offset = el.offset()
  mouse.x = e.pageX - offset.left
  mouse.y = e.pageY - offset.top
})

/* Drawing on Paint App */
ctx.lineJoin = 'round'
ctx.lineCap = 'round'

ctx.strokeStyle = "red"
ctx.lineWidth = 5

canvas.on('mousedown', function (e) {
  ctx.beginPath();
  ctx.moveTo(mouse.x, mouse.y)

  canvas.on('mousemove', onPaint)
})

canvas.on('mouseup', function () {
  onPaint()
  canvas.off('mousemove', onPaint)
})

canvas.on('mouseleave', function () {
  canvas.off('mousemove', onPaint)
})

function onPaint() {
  ctx.lineTo(mouse.x, mouse.y)
  ctx.stroke()
}

function setColor(colour) {
  ctx.strokeStyle = colour
}

function setSize(size) {
  ctx.lineWidth = size
}
