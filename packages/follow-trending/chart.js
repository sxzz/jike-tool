import data from './data.json' assert { type: 'json' }

const { Line } = window.G2Plot
const line = new Line('container', {
  data,
  xField: 'time',
  yField: 'count',
  xAxis: {
    type: 'time',
    tickCount: 5,
    mask: 'YYYY-MM-DD HH:mm:ss',
  },
  meta: {
    count: {
      tickInterval: 20,
    },
  },
  smooth: true,

  slider: {},
  tooltip: {
    showCrosshairs: true,
    shared: true,
  },
})
line.render()
