import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Graph } from '@/lib/graph';

type RelationChartProps = {
  graph: Graph;
};

const RelationChart: React.FC<RelationChartProps> = ({ graph }) => {
  if (!graph) {
    return null;
  }
  const [layoutType, setLayoutType] = useState('force');
  useEffect(() => {
    if (graph.nodes.length > 3) {
      setLayoutType('circular');
    }
  }, [graph])
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
        layout: layoutType,
        force: layoutType === 'force' ? {
          repulsion: 1000,
          edgeLength: 200
        } : undefined,
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
          curveness: layoutType === 'force' ? 0 : 0.3,
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