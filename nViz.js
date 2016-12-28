
function nViz(){

  var events = new EventsHandler()

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

  function createNode(type){
    return document.createElementNS('http://www.w3.org/2000/svg',type)
  }

  function setAttributes(node,attrs){
    for(var i in attrs){
      if(i == 'events')
        for(var e in attrs.events)
          node[e] = attrs.events[e]
      else if(i == 'data')
        for(var d in attrs.data)
          node.setAttribute('data-'+d,attrs.data[d])
      else node.setAttribute(i,attrs[i])
    }
  }

  function normalizeArgs(args){
    if((args.source && !args.x) && (args.source && !args.y)){
      var source = getCell(args.source)
      args.sourceX = source.x
      args.sourceY = source.y
    }
    if((args.target && !args.x) && (args.target && !args.y)){
      var target = getCell(args.target)
      args.targetX = target.x
      args.targetY = target.y
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

      sdr: function(args){
        var bitIndex = {}
        for(var i = 0; i < args.activeBits.length; i++)
          bitIndex[args.activeBits[i]] = true
        var sqrt = Math.sqrt(args.nBits)
        for(var y = 0; y < sqrt; y++){
          for(var x = 0; x < sqrt; x++){
            var color = bitIndex[(y*sqrt)+x] ? (args.activeColor || 'black')
              : (args.inactiveColor || 'rgba(0,0,0,0.2)')
            var bit = createNode('rect')
            setAttributes(bit,{
              height: args.size || 8,
              width: args.size || 8,
              fill: color,
              x: ((args.size || 8) + 1) * x,
              y: ((args.size || 8) + 1) * y
            })
            settings.root.appendChild(bit)
          }
        }
      },

      sdrOR: function(args){
        var bitIndex = {}
        for(var x = 0; x < args.sdrs.length; x++)
          for(var y = 0; y < args.sdrs[x].length; y++)
            bitIndex[args.sdrs[x][y]] = true
        var sqrt = Math.sqrt(args.nBits)
        for(var y = 0; y < sqrt; y++){
          for(var x = 0; x < sqrt; x++){
            var color = bitIndex[(y*sqrt)+x] ? (args.activeColor || 'black')
              : (args.inactiveColor || 'rgba(0,0,0,0.2)')
            var bit = createNode('rect')
            setAttributes(bit,{
              height: args.size || 8,
              width: args.size || 8,
              fill: color,
              x: ((args.size || 8) + 1) * x,
              y: ((args.size || 8) + 1) * y
            })
            settings.root.appendChild(bit)
          }
        }
      },

      sdrAND: function(args){
        var bitIndex = {}
        for(var x = 0; x < args.sdrs.length; x++)
          for(var y = 0; y < args.sdrs[x].length; y++)
            bitIndex[args.sdrs[x][y]] = bitIndex[args.sdrs[x][y]]+1 || 1
        var sqrt = Math.sqrt(args.nBits)
        for(var y = 0; y < sqrt; y++){
          for(var x = 0; x < sqrt; x++){
            var color = bitIndex[(y*sqrt)+x] == args.sdrs.length ?
              (args.activeColor || 'black')
              : (args.inactiveColor || 'rgba(0,0,0,0.2)')
            var bit = createNode('rect')
            setAttributes(bit,{
              height: args.size || 8,
              width: args.size || 8,
              fill: color,
              x: ((args.size || 8) + 1) * x,
              y: ((args.size || 8) + 1) * y
            })
            settings.root.appendChild(bit)
          }
        }
      },

      cell: function(args){
        args = normalizeArgs(args)
        var cell = createNode('rect')
        var attrs = {
          id: args.id,
          class: 'nViz-cell ' + (args.class || ''),
          data: args.data,
          height: args.size,
          width: args.size,
          fill: args.color || 'black',
          x: args.x || 0,
          y: args.y || 0,
          events: args.events
        }
        setAttributes(cell,attrs)
        indexCell(attrs)
        settings.root.appendChild(cell)
        return cell
      },

      dendrite: function(args){
        var dendrite = createNode('line')
        setAttributes(dendrite,{
          class: 'nViz-dendrite ' + (args.class || ''),
          data: args.data,
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
        var dendrites = []
        for(var i = 0; i < args.targets.length; i++){
          if(args.permanences)
            var opacity = args.permanences[i] > args.permananceThreshold ? 0.58 : 0.2
          else var opacity = (args.opacity || 1) * (args.targets[i].weight || 1)
          var dendrite = nViz.render.dendrite({
            sourceX: getCell(args.source).x + (args.offsetX || 0),
            sourceY: getCell(args.source).y + (args.offsetY || 0),
            targetX: getCell(args.targets[i]).x + (args.targetOffsetX || args.offsetX || 0),
            targetY: getCell(args.targets[i]).y + (args.targetOffsetY || args.offsetY || 0),
            opacity: opacity,
            class: 'nViz-distal-dendrite ' + (args.class || ''),
            data: args.data
          })
          dendrites.push(dendrite)
        }
        return dendrites
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
        var cells = []
        for(var i = 0; i < args.cells.length; i++){
          var cell = nViz.render.cell({
            id: args.cells[i].id,
            class: args.class,
            x: args.offsetX || 0,
            y: i * (args.cellSize + args.cellMargin) + (args.offsetY || 0),
            size: args.cellSize || args.cells[i].size,
            color: args.color || args.cells[i].color,
            events: args.events,
            data: args.data
          })
          cells.push(cell)
        }
        return cells
      },

      spatialPooler: function(args){
        var inputSpace = nViz.render.layer({
          cells: args.inputCells,
          cellSize: args.cellSize || 8,
          cellMargin: args.cellMargin || 1
        })
        for(var i = 0; i < args.columns.length; i++){
          var columnClassName = 'nViz-column-' + i
          var className = 'nViz-column ' + columnClassName
          var column = nViz.render.column({
            class: className,
            cells: args.columns[i].cells,
            cellSize: args.cellSize || 8,
            cellMargin: args.cellMargin || 1,
            offsetX: ((args.cellSize || 8) + (args.cellMargin || 1)) * i,
            offsetY: (args.cellSize || 8) * 10,
            events: {
              onmouseover: function(e){ events.triggerEvent(className,e) },
              onmouseleave: function(e){ events.triggerEvent('recoverColumnVisibility',e) }
            },
            data: {
              columnId: i
            }
          })
          events.addEvent(className, function(e){
            var fadeOut = document.getElementsByClassName('nViz-column')
            for(var c = 0; c < fadeOut.length; c++)
              if(fadeOut[c].className.baseVal != e.target.className.baseVal)
                fadeOut[c].setAttribute('opacity',0.2)
          })
          events.addEvent('recoverColumnVisibility', function(e){
            var cells = document.getElementsByClassName('nViz-column')
            for(var c = 0; c < cells.length; c++)
              cells[c].setAttribute('opacity',1)
          })
          var distalDendrite = nViz.render.distalDendrite({
            class: columnClassName,
            source: args.columns[i].cells[0],
            targets: args.columns[i].sources,
            offsetX: (args.cellSize || 8) * 0.5,
            targetOffsetY: (args.cellSize || 8),
            opacity: args.dendriteOpacity || 0.4,
            permananceThreshold: args.columns[i].permananceThreshold,
            permanences: args.columns[i].sourcesPermanaces,
            data: {columnId: i}
          })
          events.addEvent(className, function(e){
            var fadeOut = document.getElementsByClassName('nViz-distal-dendrite')
            for(var c = 0; c < fadeOut.length; c++)
              if(fadeOut[c].getAttribute('data-columnId') != e.target.getAttribute('data-columnId'))
                fadeOut[c].setAttribute('stroke-opacity',0.05)
          })
          events.addEvent('recoverColumnVisibility', function(e){
            var cells = document.getElementsByClassName('nViz-distal-dendrite')
            for(var c = 0; c < cells.length; c++)
              cells[c].setAttribute('stroke-opacity',1)
          })
        }
      }

    }

  }

}

nViz = nViz()
