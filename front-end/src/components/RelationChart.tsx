import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Graph } from '@/lib/graph';

type RelationChartProps = {
  graph: Graph;
};

const RelationChart: React.FC<RelationChartProps> = ({ graph }) => {
  const option = {
    title: {

    },
    tooltip: {},
    legend: [
      {
        data: graph.categories.map(function (a: { name: string }) {
          return a.name;
        })
      }
    ],
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        type: 'graph',
        layout: 'circular',
        circular: {
          rotateLabel: true
        },
        data: graph.nodes,
        links: graph.links,
        categories: graph.categories,
        roam: true,
        label: {
          position: 'right',
          formatter: '{b}'
        },
        lineStyle: {
          color: 'source',
          curveness: 0.3,
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 10
          }
        }
      }
    ]
  };

  return <ReactECharts
    option={option}
    style={{ height: '100%', width: '100%' }}
  />;
};

export default RelationChart;