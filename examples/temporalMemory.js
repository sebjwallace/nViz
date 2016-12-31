
nViz.settings({
  root:document.getElementById('svg')
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
