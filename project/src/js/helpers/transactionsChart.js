import Chart from 'chart.js/auto';

const chartAreaBorder = {
  id: 'chartAreaBorder',
  beforeDraw(chart, args, options) {
    const {
      ctx,
      chartArea: { left, top, width, height },
    } = chart;
    ctx.save();
    ctx.strokeStyle = options.borderColor;
    ctx.lineWidth = options.borderWidth;
    ctx.setLineDash(options.borderDash || []);
    ctx.lineDashOffset = options.borderDashOffset;
    ctx.strokeRect(left, top, width, height);
    ctx.restore();
  },
};

export default async function (
  element,
  posTrans,
  negTrans,
  labels,
  min,
  max,
  maxx
) {
  new Chart(element, {
    type: 'bar',
    data: {
      datasets: [
        {
          data: posTrans.map((row) => row),
          backgroundColor: ['rgba(118, 202, 102, 1)'],
        },
        {
          data: negTrans.map((row) => row),
          backgroundColor: ['rgba(253, 78, 93, 1) '],
        },
      ],
      labels,
    },
    options: {
      scales: {
        y: {
          display: false,
          stacked: true,
        },
        xys: {
          grid: {
            display: false,
          },
          position: 'right',
          min,
          max,
          ticks: {
            stepSize: 10000,
            maxTicksLimit: 4,
            callback: (value, index, values) => {
              if (index === 0) {
                return min;
              }
              if (index === 1) {
                return maxx;
              }
              if (index === 2) {
                return max;
              }
            },
          },
          afterTickToLabelConversion: (ctx) => {
            ctx.ticks = [];
            ctx.ticks.push({ value: min, label: Math.round(min) });
            ctx.ticks.push({ value: (max - min) / 2, label: Math.round(maxx) });
            ctx.ticks.push({ value: max, label: Math.round(max) });
          },
        },
        x: {
          grid: {
            display: false,
          },
          stacked: true,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        chartAreaBorder: {
          borderColor: 'black',
          borderWidth: 2,
          borderDashOffset: 2,
        },
      },
      maintainAspectRatio: false,
      events: ['mousemove', 'mouseout', 'touchstart', 'touchmove'],
    },
    plugins: [chartAreaBorder],
  });
}
