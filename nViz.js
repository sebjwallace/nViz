
function nViz(){

  var events = new EventsHandler()

  var settings = {
    root: document.querySelector('svg'),
    cellSize: 10
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
      else if(i == 'attrs')
        for(var a in attrs.attrs)
          node.setAttribute(a,attrs.attrs[a])
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
            var cellSize = args.size || settings.cellSize
            setAttributes(bit,{
              height: cellSize,
              width: cellSize,
              fill: color,
              x: (cellSize + 1) * x,
              y: (cellSize + 1) * y
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
        var color = args.color || 'black'
        color = args.activated ? 'blue' : color
        color = args.predicted ? 'yellow' : color
        var attrs = {
          id: args.id,
          class: 'nViz-cell ' + (args.class || ''),
          data: args.data,
          height: args.size || settings.cellSize,
          width: args.size || settings.cellSize,
          fill: color,
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
        args = normalizeArgs(args)
        var dendrite = createNode('path')
        var angle = Math.atan2(args.targetY-args.sourceY,args.targetX-args.sourceX)
        var path = 'M'+args.sourceX+' '+args.sourceY+' L'+args.targetX+' '+args.targetY
        if(!args.hideTail)
          path += 'M'+args.sourceX+' '+args.sourceY+' L'+args.targetX+' '+args.targetY
              +' L'+((args.targetX) + Math.cos(angle-45) * 5)+' '+((args.targetY) + Math.sin(angle-45) * 5)
              +' L'+(args.targetX)+' '+(args.targetY)
              +' L'+((args.targetX) + Math.cos(angle+45) * 5)+' '+((args.targetY) + Math.sin(angle+45) * 5)
              +' L'+(args.targetX)+' '+(args.targetY)
        setAttributes(dendrite,{
          class: 'nViz-dendrite ' + (args.class || ''),
          data: args.data,
          attrs: args.attrs,
          stroke : args.color || 'black',
          fill: 'none',
          opacity: (args.opacity || 1) * (args.weight || 1),
          d: path + ' Z'
        })
        settings.root.appendChild(dendrite)
        return dendrite
      },

      segment: function(args){
        args = normalizeArgs(args)
        var body = createNode('rect')
        setAttributes(body,{
          height: args.size || 2,
          width: args.size || 2,
          fill: args.color || 'black',
          opacity: args.opacity || 1,
          x: args.sourceX,
          y: args.sourceY,
          class: args.class,
          events: args.events,
          data: args.data,
          attrs: args.attrs
        })
        for(var i = 0; i < args.targets.length; i++){
          nViz.render.dendrite({
            sourceX: args.sourceX,
            sourceY: args.sourceY,
            target: args.targets[i].cell,
            stroke: args.color || 'black',
            opacity: (args.opacity || 1) * (args.targets[i].weight || 1),
            class: args.class,
            events: args.events,
            data: args.data,
            attrs: args.attrs
          })
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
          hideTail: true,
          sourceX: args.sourceX + (getCell(args.source).width / 2),
          sourceY: args.sourceY + (getCell(args.source).height / 2),
          targetX: x,
          targetY: y,
          opacity: args.opacity,
          class: args.class,
          events: args.events,
          data: args.data,
          attrs: args.attrs
        })
        var segment = nViz.render.segment({
          sourceX: x,
          sourceY: y,
          targets: args.targets,
          opacity: args.opacity,
          class: args.class,
          events: args.events,
          data: args.data,
          attrs: args.attrs
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
          var attrs = {
            id: args.cells[i].id,
            class: (args.class || '') + ' nViz-cell-' + i,
            x: args.offsetX || 0,
            y: i * (args.cellSize + args.cellMargin) + (args.offsetY || 0),
            size: args.cellSize || args.cells[i].size,
            color: args.color || args.cells[i].color,
            events: args.events,
            data: args.data
          }
          for(var c in args.cells[i])
            attrs[c] = args.cells[i][c]
          var cell = nViz.render.cell(attrs)
          cells.push(cell)
        }
        return cells
      },

      spatialPooler: function(args){
        var cellSize = args.cellSize || settings.cellSize
        var inputSpace = nViz.render.layer({
          cells: args.inputCells,
          cellSize: cellSize,
          cellMargin: args.cellMargin || 1
        })
        var columns = nViz.render.temporalMemory({
          columns: args.columns,
          offsetY: (cellSize) * 10
        })
        for(var i = 0; i < args.columns.length; i++){
          var className = 'nViz-column'
          var distalDendrite = nViz.render.distalDendrite({
            source: args.columns[i].cells[0],
            targets: args.columns[i].sources,
            offsetX: cellSize * 0.5,
            targetOffsetY: cellSize + 5,
            opacity: args.dendriteOpacity || 0.4,
            permananceThreshold: args.columns[i].permananceThreshold,
            permanences: args.columns[i].sourcesPermanaces,
            data: {columnIndex: i}
          })
          events.addEvent(className, function(e){
            var fadeOut = document.getElementsByClassName('nViz-distal-dendrite')
            for(var c = 0; c < fadeOut.length; c++)
              if(fadeOut[c].getAttribute('data-columnIndex') != e.target.getAttribute('data-columnIndex'))
                fadeOut[c].setAttribute('stroke-opacity',0.05)
          })
          events.addEvent('recoverColumnVisibility', function(e){
            var cells = document.getElementsByClassName('nViz-distal-dendrite')
            for(var c = 0; c < cells.length; c++)
              cells[c].setAttribute('stroke-opacity',1)
          })
        }
      },

      temporalMemory: function(args){
        var cellSize = args.cellSize || settings.cellSize
        for(var i = 0; i < args.columns.length; i++){
          var className = 'nViz-column'
          var column = nViz.render.column({
            class: className + ' nViz-column-' + i,
            cells: args.columns[i].cells,
            cellSize: cellSize,
            cellMargin: args.cellMargin || 1,
            offsetX: (cellSize + (args.cellMargin || 1)) * i,
            offsetY: args.offsetY,
            events: {
              onmouseover: function(e){ events.triggerEvent(className,e) },
              onmouseleave: function(e){ events.triggerEvent('recoverColumnVisibility',e) }
            },
            data: {columnIndex: i}
          })
          events.addEvent(className, function(e){
            var fadeOut = document.getElementsByClassName('nViz-column')
            for(var c = 0; c < fadeOut.length; c++)
              if(fadeOut[c].getAttribute('data-columnIndex') != e.target.getAttribute('data-columnIndex'))
                fadeOut[c].setAttribute('opacity',0.2)
          })
          events.addEvent('recoverColumnVisibility', function(e){
            var cells = document.getElementsByClassName('nViz-column')
            for(var c = 0; c < cells.length; c++)
              cells[c].setAttribute('opacity',1)
          })
        }
        for(var c = 0; c < args.columns.length; c++){
          for(var i = 0; i < args.columns[c].cells.length; i++){
            for(var s = 0; s < args.columns[c].cells[i].segments.length; s++){
              var segment = {
                class: 'nViz-column',
                attrs: {'stroke-opacity': 0.5},
                data:{ columnIndex: c },
                events: {
                  onmouseover: function(){console.log('segment')}
                }
              }
              for(var a in args.columns[c].cells[i].segments[s])
                segment[a] = args.columns[c].cells[i].segments[s][a]
              nViz.render.proximalDendrite(segment)
            }
          }
        }
      }

    }

  }

}

nViz = nViz()
