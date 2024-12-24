import React, { useEffect, useState, useRef } from 'react';
import ReactECharts from 'echarts-for-react';

type RelationChartProps = {
  title: string;
  x_data: number[];
  x_title: string;
  y_title: string;
  y_data: number[];
};

const TimeChart: React.FC<RelationChartProps> = ({ title, x_data, x_title, y_data, y_title }) => {
  if (!x_data || !y_data) {
    return null;
  }

  const option = {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        animation: false
      }
    },
    legend: {
      data: [y_title],
      left: 10
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    axisPointer: {
      link: [
        {
          xAxisIndex: 'all'
        }
      ]
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: 0,
        end: 100,
        xAxisIndex: [0, 1]
      },
      {
        type: 'inside',
        realtime: true,
        start: 0,
        end: 100,
        xAxisIndex: [0, 1]
      }
    ],
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        axisLine: { onZero: false },
        data: x_data.map((item) => item.toString() + "年"),
      },
    ],
    yAxis: [
      {
        name: y_title,
        type: 'value',
      }
    ],
    series: [
      {
        name: y_title,
        type: 'line',
        symbolSize: 8,
        // prettier-ignore
        data: y_data
      },
    ]
  };



  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', width: '100%' }}
    />
  );
};

export default TimeChart;
