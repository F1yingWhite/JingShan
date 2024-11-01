import React from 'react';
import ReactECharts from 'echarts-for-react';

export type PersonTime = {
  [key: string]: number;
};

interface TimeChartProps {
  chartData: PersonTime;
}

const TimeChart: React.FC<TimeChartProps> = ({ chartData }) => {
  const getOption = () => {
    const times = Object.keys(chartData);
    const counts = Object.values(chartData);

    return {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['次数'],
      },
      xAxis: {
        type: 'category',
        data: times,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '次数',
          type: 'line',
          data: counts,
          smooth: true, // 设置平滑
          itemStyle: {
            color: '#c19d50',
          },
          lineStyle: {
            width: 2, // 可根据需要设置线宽
          },
        },
      ],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
    };
  };

  return (
    <div className="w-full h-full">
      <ReactECharts option={getOption()} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default TimeChart;
