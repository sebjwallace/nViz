
nViz.settings({
  root: document.getElementById('canvas').getContext('2d'),
  outputFormat: 'canvas'
})

nViz.animate({
  steps: data,
  keyboardControl: true,
  speed: 1200,
  repeat: true,
  render: function(step){
    nViz.render.spatialPooler(step)
  }
})
