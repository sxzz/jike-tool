import data from './data.json' assert { type: 'json' }
const dayjs = window.dayjs
const { Line } = window.G2Plot

const line = new Line('container', {
  data,
  xField: 'time',
  yField: 'count',
  xAxis: {
    type: 'time',
    nice: true,
    tickInterval: 60 * 86400 * 100,
    mask: 'YYYY-MM-DD HH:mm:ss',
    label: {
      formatter: (val) => dayjs(val).format('YYYY-MM-DD'),
    },
  },
  meta: {
    count: {
      tickInterval: 20,
    },
  },
  slider: {},
  tooltip: {},
})
line.render()
