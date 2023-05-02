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

export default function (element, data, month, labels, min, max) {
  return new Chart(element, {
    type: 'bar',
    data: {
      datasets: [
        {
          data: data.map((row) => Math.floor(row)),
          backgroundColor: ['rgba(17, 106, 204, 1)'],
        },
      ],
      labels,
    },
    options: {
      scales: {
        y: {
          position: 'right',
          ticks: {
            stepSize: max - min,
          },
          min,
          max,
          grid: {
            display: false,
          },
        },
        x: {
          grid: {
            display: false,
          },
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
      events: ['mousemove', 'mouseout', 'touchstart', 'touchmove'],
    },
    plugins: [chartAreaBorder],
  });
}
