import React, { useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Graph } from '@/lib/graph';

type RelationChartProps = {
  graph: Graph;
};

const RelationChart: React.FC<RelationChartProps> = ({ graph }) => {
  if (!graph) {
    return null;
  }
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
        edgeSymbol: ['none', 'arrow'],
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 10
          }
        }
      }
    ]
  };

  useEffect(() => {
  }, [graph])
  const onEvents = {
    'click': (params: any) => {
      if (params.dataType === 'node') {
        window.location.href = `/graph/${params.data.name}`;
      }
    }
  };

  return <ReactECharts
    option={option}
    style={{ height: '100%', width: '100%' }}
    onEvents={onEvents}
  />;
};

export default RelationChart;