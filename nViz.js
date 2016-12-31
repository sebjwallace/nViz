
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
    else if(cellIndex[cell.id])
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
      for(var i in args)
        settings[i] = args[i]
    },

    clear: function(root){
      (root || settings.root).innerHTML = ''
    },

    animate: function(args){
      var step = 1
      if(!args.keyboardControl){
        var interval = setInterval(function(){
          (args.root || settings.root).innerHTML = ''
          args.render(args.steps[step])
          step++
          if(step >= args.steps.length){
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
            step += (step < (args.steps.length-1) ? 1 : 0)
          settings.root.innerHTML = ''
          args.render(args.steps[step])
        }
      }
      args.render(args.steps[0])
    },

    render: {

      cell: function(args){
        args = normalizeArgs(args)
        var size = args.size || settings.size
        var cell = createNode('circle')
        var color = args.color || 'lightgray'
        color = args.inActiveColumn ? 'rgb(210,210,140)' : color
        color = args.activated ? 'yellow' : color
        color = args.predicted ? 'orange' : color
        var attrs = {
          id: args.id,
          class: 'nViz-cell ' + (args.class || ''),
          height: size,
          width: size,
          r: size / 2,
          fill: color,
          x: args.x || 0, cx: (args.x + (size * 0.5)) || 0,
          y: args.y || 0, cy: (args.y + (size * 0.5)) || 0,
          'data-activated': args.activated,
          'data-predicted': args.predicted
        }
        setAttributes(cell,merge(attrs,args))
        indexCell(attrs)
        settings.root.appendChild(cell)
        return cell
      },

      dendrite: function(args){
        args = normalizeArgs(args)
        var body = createNode('circle')
        var size = args.headSize || args.size || 2
        if(!args.hideHead){
          setAttributes(body,merge({
            r: args.headSize || size,
            cx: args.sourceX,
            cy: args.sourceY,
            fill: args.color || 'black',
            opacity: args.opacity || 1,
            attrs: { 'fill-opacity': args.attrs['stroke-opacity'] * 2 }
          },args))
          settings.root.appendChild(body)
        }
        var cellSize = args.cellSize || settings.cellSize
        var centered = args.noAlignment ? 0 : (cellSize * 0.5)
        var direction = Math.atan2(args.targetY-args.sourceY,args.targetX-args.sourceX)
        var dendrite = createNode('path')
        var sX = args.sourceX
        var sY = args.sourceY
        var tX = args.targetX + centered - (Math.cos(direction) * centered)
        var tY = args.targetY + centered - (Math.sin(direction) * centered)
        var angle = Math.atan2(tY-sY,tX-sX)
        var path = 'M'+sX+' '+sY+' L'+tX+' '+tY+' '
        if(!args.hideTail)
          path += 'M'+sX+' '+sY+' L'+tX+' '+tY
              +' L'+((tX) + Math.cos(angle-45) * 5)+' '+((tY) + Math.sin(angle-45) * 5)
              +' L'+(tX)+' '+(tY)
              +' L'+((tX) + Math.cos(angle+45) * 5)+' '+((tY) + Math.sin(angle+45) * 5)
              +' L'+(tX)+' '+(tY)
        setAttributes(dendrite,merge({
          class: 'nViz-dendrite ' + (args.class || ''),
          stroke : args.color || 'black',
          fill: 'none',
          opacity: (args.opacity || 1) * (args.weight || 1),
          d: path + ' Z',
          style: 'pointer-events: none'
        },args))
        settings.root.appendChild(dendrite)
        return dendrite
      },

      segment: function(args){
        args = normalizeArgs(args)
        for(var i = 0; i < args.targets.length; i++){
          var target = args.targets[i]
          var dendriteOpacity = target.permanance > target.permananceThreshold ? 0.2 : 0.08
          args.attrs['stroke-opacity'] = dendriteOpacity
          nViz.render.dendrite(merge({
            headSize: 1,
            target: getCell(args.targets[i]),
            opacity: (args.opacity || 1) * (args.targets[i].weight || 1),
            color: getCell(args.source)['data-predicted'] && getCell(target)['data-activated'] ?
              'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)'
          },args))
        }
      },

      proximalDendrite: function(args){
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
        var dendrite = nViz.render.dendrite(merge({
          hideTail: true,
          noAlignment: true,
          sourceX: args.sourceX + (getCell(args.source).width / 2),
          sourceY: args.sourceY + (getCell(args.source).height / 2),
          targetX: x,
          targetY: y,
        },args))
        var segment = nViz.render.segment(merge({
          sourceX: x,
          sourceY: y,
        },args))
      },

      distalDendrite: function(args){
        for(var i = 0; i < args.targets.length; i++){
          if(args.permanences)
            var opacity = args.permanences[i] > args.permananceThreshold ? 0.2 : 0.08
          else var opacity = (args.opacity || 0.4) * (args.targets[i].weight || 0.4)
          var source = getCell(args.source)
          var target = getCell(args.targets[i])
          if(source && target){
            nViz.render.dendrite(merge({
              color: (target['data-activated'] && args.activeColumn) ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.2)',
              sourceX: source.x + (args.sourceOffsetX || args.offsetX || 0),
              sourceY: source.y + (args.sourceOffsetY || args.offsetY || 0),
              targetX: target.x + (args.targetOffsetX || args.offsetX || 0),
              targetY: target.y + (args.targetOffsetY || args.offsetY || 0),
              class: 'nViz-distal-dendrite ' + (args.class || ''),
              attrs: { 'stroke-opacity': opacity }
            },args))
          }
        }
      },

      layer: function(args){
        for(var i = 0; i < args.cells.length; i++){
          nViz.render.cell(merge({
            id: args.cells[i].id,
            x: i * (args.cellSize + args.cellMargin),
            y: args.offset || 0,
            size: args.cellSize || args.cells[i].size,
            color: args.color || args.cells[i].color,
            activated: args.cells[i].activated,
            predicted: args.cells[i].predicted
          },args))
        }
      },

      column: function(args){
        for(var i = 0; i < args.cells.length; i++){
          var cell = nViz.render.cell(merge({
            id: args.cells[i].id,
            class: (args.class || '') + ' nViz-cell-' + i,
            x: args.offsetX || 0,
            y: i * (args.cellSize + args.cellMargin) + (args.offsetY || 0),
            size: args.cellSize || args.cells[i].size,
            color: args.color || args.cells[i].color,
            inActiveColumn: args.active ? true : false,
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
          var distalDendrite = nViz.render.distalDendrite(merge({
            source: args.columns[i].cells[0],
            targets: args.columns[i].sources,
            sourceOffsetX: (args.cellSize || settings.cellSize) * 0.5,
            permananceThreshold: args.columns[i].permananceThreshold,
            permanences: args.columns[i].permanences,
            activeColumn: args.columns[i].active,
            data: {columnIndex: i}
          },args))
          events.addEvent(className, function(e){
            var fadeOut = document.getElementsByClassName('nViz-distal-dendrite')
            for(var c = 0; c < fadeOut.length; c++)
              if(fadeOut[c].getAttribute('data-columnIndex') != e.target.getAttribute('data-columnIndex'))
                fadeOut[c].setAttribute('opacity',0.01)
          })
          events.addEvent('recoverColumnVisibility', function(e){
            var cells = document.getElementsByClassName('nViz-distal-dendrite')
            for(var c = 0; c < cells.length; c++)
              cells[c].setAttribute('opacity',1)
          })
        }
      },

      temporalMemory: function(args){
        var cellSize = args.cellSize || settings.cellSize
        for(var i = 0; i < args.columns.length; i++){
          var className = 'nViz-column'
          var column = nViz.render.column(merge({
            class: className + ' nViz-column-' + i,
            cells: args.columns[i].cells,
            cellSize: cellSize,
            cellMargin: args.cellMargin || 1,
            offsetX: (cellSize + (args.cellMargin || 1)) * i,
            active: args.columns[i].active,
            events: {
              onmouseenter: function(e){ events.triggerEvent(className,e) },
              onmouseleave: function(e){ events.triggerEvent('recoverColumnVisibility',e) }
            },
            data: {columnIndex: i}
          },args))
          events.addEvent(className, function(e){
            var fadeOut = document.getElementsByClassName('nViz-column')
            for(var c = 0; c < fadeOut.length; c++)
              if(fadeOut[c].getAttribute('data-columnIndex') != e.target.getAttribute('data-columnIndex'))
                fadeOut[c].setAttribute('opacity',0)
          })
          events.addEvent('recoverColumnVisibility', function(e){
            var fadeIn = document.getElementsByClassName('nViz-column')
            for(var c = 0; c < fadeIn.length; c++)
              fadeIn[c].setAttribute('opacity',1)
          })
        }
        for(var c = 0; c < args.columns.length; c++){
          for(var i = 0; i < args.columns[c].cells.length; i++){
            for(var s = 0; s < args.columns[c].cells[i].segments.length; s++){
              var segment = {
                class: 'nViz-column',
                attrs: {'stroke-opacity': 0.2},
                data: { columnIndex: c },
                cellSize: cellSize,
                opacity: args.columns[c].cells[i].predicted ? 1 : 0.01
              }
              for(var a in args.columns[c].cells[i].segments[s])
                segment[a] = args.columns[c].cells[i].segments[s][a]
              nViz.render.proximalDendrite(merge(segment,args))
            }
          }
        }
      },

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
      }

    }

  }

}

nViz = nViz()
