
nViz.settings({
  canvas: document.getElementById('canvas1'),
  inactiveBitColor: 'rgba(0,0,0,0.1)'
})

nViz.render.sdr({
  nBits: 1024,
  activeBits: [2,50,125,200,570,800,920,1010,1020],
  cellSize: 3
})

nViz.settings({
  canvas: document.getElementById('canvas2'),
})

nViz.render.sdrAND({
  nBits: 1024,
  sdrs: [
    [2,50,125,200,570,800,920,1010,1020],
    [8,50,140,200,570,820,980,1000,1020]
  ],
  cellSize: 3
})

nViz.settings({
  canvas: document.getElementById('canvas3')
})

nViz.render.sdrOR({
  nBits: 1024,
  sdrs: [
    [2,50,125,200,570,800,920,1010,1020],
    [8,50,140,200,570,820,980,1000,1020]
  ],
  cellSize: 3
})
