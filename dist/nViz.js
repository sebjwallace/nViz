
/*
   nViz - Neural Vizualization Library
*/

function nViz(){

  var settings = {
    cellSize: 10,
    cellMargin: 1,
    synapseSize: 2,
    inactiveCellColor: 'lightgray',
    activeCellColor: 'yellow',
    predictedCellColor: 'orange',
    activeColumnCellColor: 'rgb(210,210,140)',
    activeDendriteColor: 'rgba(0,0,0,0.4)',
    inactiveDendriteColor: 'rgba(0,0,0,0.02)'
  }

  var mouseX = 0
  var mouseY = 0

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
    else if(cellIndex[cell.id])
      return cellIndex[cell.id].cell
  }

  function createNode(type){
    return {type:type}
  }

  function isInBounds(x,y,r){
    if(mouseX == 0 && mouseY == 0)
      return true
    var dx = mouseX - x
    var dy = mouseY - y
    return (dx*dx) + (dy*dy) <= (r * r)
  }

  function setAttributes(node,attrs){
    var ctx = settings.context
    if(node.type == 'rect'){
      ctx.fillStyle = attrs.fill || 'black'
      ctx.globalAlpha = attrs.opacity,
      ctx.fillRect(attrs.x,attrs.y,attrs.height,attrs.width || attrs.height)
    }
    if(node.type == 'circle'){
      ctx.beginPath()
      ctx.arc(attrs.cx,attrs.cy,attrs.r,0*Math.PI,2*Math.PI)
      ctx.closePath()
      ctx.globalAlpha = (attrs.attrs || {})['fill-opacity'] || attrs.opacity || 1
      ctx.fillStyle = attrs.fill
      ctx.fill()
    } else if(node.type == 'path'){
      ctx.beginPath()
      for(var i = 0; i < attrs.path.length; i++){
        ctx.lineTo(attrs.path[i][0],attrs.path[i][1])
        ctx.moveTo(attrs.path[i][0],attrs.path[i][1])
      }
      ctx.globalAlpha = attrs.opacity || (attrs.attrs || {})['stroke-opacity'] || 1
      ctx.strokeStyle = attrs.stroke
      ctx.closePath()
      ctx.stroke()
    }
  }

  function normalizeArgs(args){
    if((args.source && !args.x) && (args.source && !args.y)
      && (args.source && !args.sourceX) && (args.source && !args.sourceY)){
      var source = getCell(args.source)
      args.sourceX = source.x
      args.sourceY = source.y
    }
    if((args.target && !args.x) && (args.target && !args.y)
        && (args.target && !args.targetX) && (args.target && !args.targetY)){
      var target = getCell(args.target)
      args.targetX = target.x
      args.targetY = target.y
    }
    return args
  }

  function merge(a,b){
    var copy = {}
    for(var i in b)
      copy[i] = b[i]
    for(var i in a)
      copy[i] = a[i]
    return copy
  }

  return {

    settings: function(args){
      cellIndex = {}
      for(var i in args){
        settings[i] = args[i]
        if(i == 'canvas'){
          settings.context = args[i].getContext('2d')
          args[i].onmousemove = function(e){
            mouseX = e.pageX - this.offsetLeft
            mouseY = e.pageY - this.offsetTop
          }
        }
      }
    },

    clear: function(canvas){
      var canvas = settings.canvas
      settings.context.clearRect(0,0,canvas.height,canvas.width)
    },

    animate: function(args){
      var step = 0
      var steps = args.steps || []
      settings.canvas.onclick = function(){
        nViz.clear()
        args.render(steps[step])
      }
      if(!args.keyboardControl){
        var interval = setInterval(function(){
          nViz.clear()
          args.render(steps[step])
          step++
          if(step >= steps.length){
            if(args.repeat)
              step = 0
            else
              clearInterval(interval)
          }
        },args.speed)
      } else{
        document.body.onkeyup = function(e){
          if(e.keyCode == 37)
            step -= (step > 0 ? 1 : 0)
          else if(e.keyCode == 39)
            step += (step < (steps.length-1) ? 1 : 0)
          mouseX = 0
          mouseY = 0
          nViz.clear()
          args.render(steps[step])
        }
      }
      args.render(steps[step])
    },

    render: {

      cell: function(args){
        args = normalizeArgs(args)
        var size = args.size || settings.size || settings.cellSize
        var cell = createNode('circle')
        var color = settings.inactiveCellColor
        color = args.inActiveColumn ? settings.activeColumnCellColor : color
        color = args.activated ? settings.activeCellColor : color
        color = args.predicted ? settings.predictedCellColor : color
        var x = args.x + (size * 0.5)
        var y = args.y + (size * 0.5)
        var attrs = {
          id: args.id,
          height: size,
          width: size,
          x: args.x,
          y: args.y,
          cx: x,
          cy: y,
          r: size / 2,
          fill: color,
          opacity: isInBounds(x,y,size/2) ? 1 : 0.1,
          'data-activated': args.activated,
          'data-predicted': args.predicted
        }
        setAttributes(cell,merge(attrs,args))
        indexCell(attrs)
        return cell
      },

      dendrite: function(args){
        args = normalizeArgs(args)
        var body = createNode('circle')
        var size = args.headSize || 2
        var cellSize = args.cellSize || settings.cellSize || getCell(args.source).height
        var centered = cellSize * 0.5
        if(!args.hideHead){
          setAttributes(body,{
            r: args.headSize || size,
            cx: args.sourceX + centered,
            cy: args.sourceY + centered,
            fill: args.color || 'black',
            opacity: args.opacity || 1
          })
        }
        var direction = Math.atan2(args.targetY-args.sourceY,args.targetX-args.sourceX)
        var dendrite = createNode('path')
        var sX = args.sourceX + centered
        var sY = args.sourceY + centered
        var tX = args.targetX + centered - (args.hideTail ? 0 : (Math.cos(direction) * centered))
        var tY = args.targetY + centered - (args.hideTail ? 0 : (Math.sin(direction) * centered))
        var angle = Math.atan2(tY-sY,tX-sX)
        var synapseSize = settings.synapseSize
        setAttributes(dendrite,merge({
          stroke : args.color || 'black',
          fill: 'none',
          opacity: (args.opacity || 1) * (args.weight || 1),
          path: args.hideTail ? [[sX,sY],[tX,tY]] : [[sX,sY],[tX,tY],
            [(tX) + Math.cos(angle-45) * synapseSize,
              (tY) + Math.sin(angle-45) * synapseSize],
            [tX,tY],
            [(tX) + Math.cos(angle+45) * synapseSize,
              (tY) + Math.sin(angle+45) * synapseSize],
            [tX,tY]
          ]
        },args))
        return dendrite
      },

      segment: function(args){
        args = normalizeArgs(args)
        for(var i = 0; i < args.targets.length; i++){
          var target = args.targets[i]
          var dendriteOpacity = target.permanance > target.permananceThreshold ? 0.2 : 0.08
          var cellNode = getCell(args.targets[i])
          nViz.render.dendrite(merge({
            headSize: 1,
            target: getCell(args.targets[i]),
            opacity: (args.opacity || 1) * (args.targets[i].weight || 1),
            color: cellNode['data-predicted'] || cellNode['data-activated'] ?
              settings.activeDendriteColor : settings.inactiveDendriteColor
          },args))
        }
      },

      distalDendrite: function(args){
        args = normalizeArgs(args)
        var arrX = args.targets.map(function(v)
          {return getCell(v.cell || v.id).x})
        var arrY = args.targets.map(function(v)
          {return getCell(v.cell || v.id).y})
        var maxX = Math.max.apply(null,arrX)
        var minX = Math.min.apply(null,arrX)
        var maxY = Math.max.apply(null,arrY)
        var minY = Math.min.apply(null,arrY)
        var deltaX = args.sourceX - minX
        var deltaY = args.sourceY - minY
        var x = minX + ((maxX - minX) / 2) + (deltaX * 0.25)
        var y = minY + ((maxY - minY) / 2) + (deltaY * 0.25)
        var cellNode = getCell(args.source)
        var dendrite = nViz.render.dendrite(merge({
          hideTail: true,
          source: args.source,
          targetX: x,
          targetY: y,
          color: cellNode['data-predicted'] || cellNode['data-activated'] ?
            settings.activeDendriteColor : settings.inactiveDendriteColor
        },args))
        var segment = nViz.render.segment(merge({
          sourceX: x,
          sourceY: y,
          targets: args.targets
        },args))
      },

      proximalDendrite: function(args){
        for(var i = 0; i < args.targets.length; i++){
          if(args.permanences)
            var opacity = args.permanences[i] > args.permananceThreshold ? 0.2 : 0.08
          else var opacity = (args.opacity || 0.4) * (args.targets[i].weight || 0.4)
          var source = getCell(args.source)
          var target = getCell(args.targets[i])
          if(source && target){
            nViz.render.dendrite(merge({
              color: (target['data-activated'] && args.activeColumn) ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)',
              sourceX: source.x + (args.sourceOffsetX || args.offsetX || 0),
              sourceY: source.y + (args.sourceOffsetY || args.offsetY || 0),
              targetX: target.x + (args.targetOffsetX || args.offsetX || 0),
              targetY: target.y + (args.targetOffsetY || args.offsetY || 0),
            },args))
          }
        }
      },

      layer: function(args){
        for(var i = 0; i < args.cells.length; i++){
          var cellSize = args.cellSize || settings.cellSize
          var cellMargin = args.cellMargin || settings.cellMargin
          nViz.render.cell(merge({
            id: args.cells[i].id,
            x: i * (cellSize + cellMargin) + ((args.offsetX || args.offset) || 0),
            y: args.offsetY || args.offset || 0,
            size: cellSize,
            color: args.color || args.cells[i].color,
            activated: args.cells[i].activated,
            predicted: args.cells[i].predicted
          },args))
        }
      },

      column: function(args){
        for(var i = 0; i < args.cells.length; i++){
          var cellSize = args.cellSize || settings.cellSize
          var cellMargin = args.cellMargin || settings.cellMargin
          var cell = nViz.render.cell(merge({
            id: args.cells[i].id,
            x: args.offsetX || args.offset || 0,
            y: i * (cellSize + cellMargin) + (args.offsetY || args.offset || 0),
            size: args.cellSize || args.cells[i].size,
            color: args.color || args.cells[i].color,
            inActiveColumn: args.active ? true : false
          },args.cells[i]))
        }
      },

      spatialPooler: function(args){
        var cellSize = args.cellSize || settings.cellSize
        var inputSpace = nViz.render.layer(merge({
          cells: args.inputCells,
          cellSize: args.inputCellSize || cellSize,
          color: args.inputCellColor || 'lightgray',
          cellMargin: args.cellMargin || 1
        },args))
        var columns = nViz.render.temporalMemory(merge({
          columns: args.columns,
          offsetY: (cellSize) * 10,
          cellSize: args.columnCellSize || cellSize
        },args))
        for(var i = 0; i < args.columns.length; i++){
          var className = 'nViz-column'
          var proximalDendrite = nViz.render.proximalDendrite(merge({
            source: args.columns[i].cells[0],
            targets: args.columns[i].sources,
            sourceOffsetX: (args.cellSize || settings.cellSize) * 0.5,
            permananceThreshold: args.columns[i].permananceThreshold,
            permanences: args.columns[i].permanences,
            activeColumn: args.columns[i].active,
            data: {columnIndex: i}
          },args))
        }
      },

      temporalMemory: function(args){
        var cellSize = args.cellSize || settings.cellSize
        for(var i = 0; i < args.columns.length; i++){
          var column = nViz.render.column(merge({
            cells: args.columns[i].cells,
            cellSize: cellSize,
            cellMargin: args.cellMargin || 1,
            offsetX: (cellSize + (args.cellMargin || 1)) * i,
            active: args.columns[i].active
          },args))
        }
        for(var c = 0; c < args.columns.length; c++){
          for(var i = 0; i < args.columns[c].cells.length; i++){
            if(args.withoutSegments && args.columns[c].cells[i].segments.length){
              var source = args.columns[c].cells[i]
              for(var s = 0; s < args.columns[c].cells[i].segments.length; s++){
                for(var t = 0; t < args.columns[c].cells[i].segments[s].targets.length; t++){
                  var target = args.columns[c].cells[i].segments[s].targets[t]
                  nViz.render.dendrite({
                    source: source,
                    target: target,
                    cellSize: cellSize,
                    opacity: source.predicted ? 0.8 : 0.1,
                    color: getCell(source).opacity == 1 ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.02)'
                  })
                }
              }
            } else {
              for(var s = 0; s < args.columns[c].cells[i].segments.length; s++){
                var segment = {
                  data: { columnIndex: c },
                  cellSize: cellSize,
                  opacity: args.columns[c].cells[i].predicted ? 1 : 0.1
                }
                for(var a in args.columns[c].cells[i].segments[s])
                  segment[a] = args.columns[c].cells[i].segments[s][a]
                nViz.render.distalDendrite(merge(segment,args))
              }
            }
          }
        }
      },

      SDRgrid: function(args){
        var sqrt = Math.sqrt(args.numBits)
        for(var y = 0; y < sqrt; y++){
          for(var x = 0; x < sqrt; x++){
            var isActive = args.condition ? args.condition(x,y,sqrt) : args.activeBits[(y*sqrt)+x]
            var color = isActive ? (args.activeColor || 'black')
              : (settings.inactiveBitColor || 'rgba(0,0,0,0.2)')
            var bit = createNode('rect')
            var cellSize = args.cellSize || settings.cellSize
            setAttributes(bit,{
              height: cellSize,
              width: cellSize,
              fill: color,
              opacity: 1,
              x: (cellSize + 1) * x,
              y: (cellSize + 1) * y
            })
          }
        }
      },

      sdr: function(args){
        var bitIndex = {}
        for(var i = 0; i < args.activeBits.length; i++)
          bitIndex[args.activeBits[i]] = true
        nViz.render.SDRgrid({
          numBits: args.nBits,
          activeBits: bitIndex,
          cellSize: 3
        })
      },

      sdrOR: function(args){
        var bitIndex = {}
        for(var x = 0; x < args.sdrs.length; x++)
          for(var y = 0; y < args.sdrs[x].length; y++)
            bitIndex[args.sdrs[x][y]] = true
        nViz.render.SDRgrid({
          numBits: args.nBits,
          activeBits: bitIndex,
          cellSize: 3
        })
      },

      sdrAND: function(args){
        var bitIndex = {}
        for(var x = 0; x < args.sdrs.length; x++)
          for(var y = 0; y < args.sdrs[x].length; y++)
            bitIndex[args.sdrs[x][y]] = bitIndex[args.sdrs[x][y]]+1 || 1
        nViz.render.SDRgrid({
          numBits: args.nBits,
          activeBits: bitIndex,
          condition: function(x,y,sqrt){
            return bitIndex[(y*sqrt)+x] == args.sdrs.length
          },
          cellSize: 3
        })
      }

    }

  }

}

nViz = nViz()
