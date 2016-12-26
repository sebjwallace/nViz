
function nViz(){

  function createNode(type){
    return document.createElementNS('http://www.w3.org/2000/svg',type)
  }

  function setAttributes(node,attrs){
    for(var i in attrs)
      node.setAttribute(i,attrs[i])
  }

  var settings = {
    root: document.querySelector('svg')
  }

  var cellIndex = {}
  function indexCell(cell,x,y){
    cellIndex[cell.id] = {
      cell: cell,
      x: x || 0,
      y: y || 0
    }
  }
  function getCell(cell){
    if(typeof cell == 'string')
      return cellIndex[cell].cell
    else if(cell.id)
      return cellIndex[cell.id].cell
  }

  function normalizeArgs(args){
    if((args.source && !args.x) && (args.source && !args.y)){
      args.sourceX = args.source.x
      args.sourceY = args.source.y
    }
    if((args.target && !args.x) && (args.target && !args.y)){
      args.targetX = args.target.x
      args.targetY = args.target.y
    }
    return args
  }

  return {

    settings: function(args){
      cellIndex = {}
      for(var i in args)
        settings[i] = args[i]
    },

    clear: function(root){
      (root || settings.root).innerHTML = ''
    },

    render: {

      cell: function(args){
        args = normalizeArgs(args)
        var cell = createNode('rect')
        var attrs = {
          id: args.id,
          height: args.size,
          width: args.size,
          fill: args.color || 'black',
          x: args.x || 0,
          y: args.y || 0
        }
        setAttributes(cell,attrs)
        indexCell(attrs)
        settings.root.appendChild(cell)
        return cell
      },

      dendrite: function(args){
        var dendrite = createNode('line')
        setAttributes(dendrite,{
          stroke : args.color || 'black',
          opacity: (args.opacity || 1) * (args.weight || 1),
          x1: args.sourceX,
          y1: args.sourceY,
          x2: args.targetX,
          y2: args.targetY
        })
        settings.root.appendChild(dendrite)
        return dendrite
      },

      segment: function(args){
        var body = createNode('rect')
        setAttributes(body,{
          height: args.size || 4,
          width: args.size || 4,
          fill: args.color || 'black',
          x: args.sourceX,
          y: args.sourceY
        })
        for(var i = 0; i < args.targets.length; i++){
          var target = getCell(args.targets[i].cell)
          var targetX = args.targets[i].x || target.x
          var targetY = args.targets[i].y || target.y
          var synapse = createNode('line')
          setAttributes(synapse,{
            x1: args.sourceX + ((args.size || 0) / 2),
            y1: args.sourceY + ((args.size || 0) / 2),
            x2: targetX,
            y2: targetY,
            stroke: args.color || 'black',
            opacity: (args.opacity || 1) * (args.targets[i].weight || 1)
          })
          settings.root.appendChild(synapse)
        }
        settings.root.appendChild(body)
      },

      proximalDendrite: function(args){
        args = normalizeArgs(args)
        var arrX = args.targets.map(function(v)
          {return getCell(v.cell).x})
        var arrY = args.targets.map(function(v)
          {return getCell(v.cell).y})
        var maxX = Math.max.apply(null,arrX)
        var minX = Math.min.apply(null,arrX)
        var maxY = Math.max.apply(null,arrY)
        var minY = Math.min.apply(null,arrY)
        var deltaX = args.sourceX - minX
        var deltaY = args.sourceY - minY
        var x = minX + ((maxX - minX) / 2) + (deltaX * 0.25)
        var y = minY + ((maxY - minY) / 2) + (deltaY * 0.25)
        var dendrite = nViz.render.dendrite({
          sourceX: args.sourceX,
          sourceY: args.sourceY,
          targetX: x,
          targetY: y,
          opacity: args.opacity
        })
        var segment = nViz.render.segment({
          sourceX: x,
          sourceY: y,
          targets: args.targets,
          opacity: args.opacity
        })
      },

      distalDendrite: function(args){
        for(var i = 0; i < args.targets.length; i++){
          var dendrite = nViz.render.dendrite({
            sourceX: args.sourceX,
            sourceY: args.sourceY,
            targetX: args.targets[i].x,
            targetY: args.targets[i].y,
            opacity: (args.opacity || 1) * (args.targets[i].weight || 1)
          })
        }
      },

      layer: function(args){
        for(var i = 0; i < args.cells.length; i++){
          var cell = {
            id: args.cells[i].id,
            x: i * (args.cellSize + args.cellMargin),
            y: args.offset || 0,
            size: args.cellSize || args.cells[i].size,
            color: args.color || args.cells[i].color
          }
          nViz.render.cell(cell)
        }for(var i = 0; i < args.cells.length; i++){
          var cell = {
            id: args.cells[i].id,
            x: i * (args.cellSize + args.cellMargin),
            y: args.offset || 0,
            size: args.cellSize || args.cells[i].size,
            color: args.color || args.cells[i].color
          }
          nViz.render.cell(cell)
        }
      },

      column: function(args){
        for(var i = 0; i < args.cells.length; i++){
          var cell = {
            id: args.cells[i].id,
            x: args.offset || 0,
            y: i * (args.cellSize + args.cellMargin),
            size: args.cellSize || args.cells[i].size,
            color: args.color || args.cells[i].color
          }
          nViz.render.cell(cell)
        }
      }

    }

  }

}

nViz = nViz()
