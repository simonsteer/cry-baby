
function visible() {
  document.querySelector('.graph__marker').style.visibility = 'visible'
}

function hidden() {
  document.querySelector('.graph__marker').style.visibility = 'hidden'
}

let allStats
let history
let cur

const tracker = (event) => {

  const
    canvas = document.querySelector('.graph'),
    list = document.querySelector('.graph__time-increment'),
    height = canvas.clientHeight - (list.clientHeight * 2),
    offsetEl = document.querySelector('.currencies-tracked'),

    plotPoints = allStats.length - 1,
    increment = (canvas.offsetWidth - 40) / plotPoints,
    scale = Math.max(...allStats) / height,
    markers = []

  let position

  if (window.innerWidth <= 750) {
    position = event.pageX - canvas.offsetWidth / 2
  } else {
    position = event.pageX - offsetEl.offsetWidth - canvas.offsetWidth / 2
  }

  for (let i = 0; i <= plotPoints; i++) {
    markers[i] = increment * i
  }

  const p = position + (canvas.offsetWidth / 2) - 20

  markers.push(p)
  markers.sort((a, b) => a - b)

  const index = markers.indexOf(p)

  const
    marker = document.querySelector('.graph__marker'),
    dot = document.querySelector('.graph__dot'),
    info = document.querySelector('.graph__header'),

    previousMarker = markers[Math.floor(p / increment)],
    nextMarker = markers[Math.floor(p / increment) + 2],

    newPosition = p - previousMarker,
    multiplier = (newPosition / increment).toFixed(2),

    difference = (allStats[index] - allStats[index - 1]) / scale,
    indexValue = allStats[index - 1] / scale,

    moveX = {
      left: `calc(${p}px + 20px)`
    },
    moveY = {
      top: `calc(${(height + canvas.offsetHeight) / 2}px - ${indexValue}px - ${difference * multiplier}px - 0.25rem)`
    }

  const
    infoX = index < allStats.length / 2 ? '1.5rem' : `calc(-${info.clientWidth}px - 1rem)`,
    infoY = indexValue < (height / 2) ? `calc(-${info.clientHeight}px - 1.5rem)` : '0rem',

    infoTextAlign = index < allStats.length / 2 ? 'left' : 'right',

    infoStyles = {
      transform: `translate(${infoX}, ${infoY})`,
      textAlign: infoTextAlign
    }

  Object.assign(info.style, infoStyles)
  Object.assign(marker.style, moveX)
  Object.assign(dot.style, moveY)

  let day = new Date(history[index].time * 1000)
  let value = history[index].close
  
  if (multiplier <= 0.5) {
    day = new Date(history[index - 1].time * 1000)
    value = history[index - 1].close
  }

  day = day.toString().substr(0, 15)

  info.innerHTML =
    `${day}: ${value.toLocaleString(
      cur === 'CNY' ? 'zh-Hans-CN' : 'en-US',
      {
        style: 'currency',
        currency: cur === 'USD' || cur === 'CAD' || cur === 'AUD' ? 'USD' : cur,
        maximumFractionDigits: 6
      })
    }`

}

export function draw(stats, info, color, currency) {

  history = info
  cur = currency

  const canvas = document.getElementById('canvas')

  if (!canvas) {
    return
  }

  const context = canvas.getContext('2d'),
    width = canvas.width = canvas.clientWidth,
    height = canvas.height = canvas.clientHeight;

  // The returned array's first and last indeces will be used to determine the highest and lowest values to display
  // These values will be used to set the scale of the graph so that it draws in aspect

  // This variable determines the highest value of data to be plotted
  // Will be used to set the scale of the graph so that it draws in aspect
  const highest = Math.max(...stats)

  // The scale variable makes sure that no data is plotted outside of the bounds of the canvas
  const scale = highest / height;

  // The left variable is used to determine the plot point's position on the graph's x-axis, starting at 0
  let prev_stat = stats[0] / scale,
    move_left_by = (width / (stats.length - 1)),
    left = 0

  context.translate(-move_left_by, height);
  context.scale(1, -1);

  for (let stat in stats) {
    const the_stat = stats[stat] / scale;
    context.beginPath();
    context.moveTo(left, prev_stat);
    context.lineTo(left + move_left_by, the_stat);
    context.lineWidth = 1;
    context.lineCap = 'round';
    context.strokeStyle = color;

    prev_stat = the_stat;
    left += move_left_by;

    context.stroke()
  }

  allStats = stats

  canvas.removeEventListener('mousemove', tracker, false)
  canvas.addEventListener('mousemove', tracker, false)

  canvas.removeEventListener('mouseenter', visible, false)
  canvas.addEventListener('mouseenter', visible, false)
  
  canvas.removeEventListener('mouseleave', hidden, false)
  canvas.addEventListener('mouseleave', hidden, false)  

}