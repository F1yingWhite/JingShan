import React, { useEffect, useState, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { Graph } from '@/lib/graph';

type RelationChartProps = {
  graph: Graph;
  layout: "force" | "circular" | "none";
};

const RelationChart: React.FC<RelationChartProps> = ({ graph, layout }) => {
  if (!graph) {
    return null;
  }
  const [layoutType, setLayoutType] = useState('force');
  const chartRef = useRef(null);

  useEffect(() => {
    if (layout === "none") {
      if (graph.nodes.length > 3) {
        setLayoutType('circular');
      }
    } else {
      setLayoutType(layout);
    }
  }, [graph]);

  const option = {
    title: {},
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
        zoom: layout !== 'none' ? 0.3 : 1,
        scaleLimit: {
          min: 0.1,
          max: 10
        },
        data: graph.nodes,
        links: graph.links,
        categories: graph.categories,
        roam: true,
        label: {
          position: 'inside',
          formatter: function (params: any) {
            if (layout === "none") {
              return params.data.name;
            } else {
              return params.data.value > 4 ? params.data.name : '';
            }
          },
          fontSize: 14,
        },
        lineStyle: {
          color: 'source',
          curveness: layoutType === 'force' ? 0 : 0.3,
        },
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: 7,
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 10
          }
        }
      }
    ]
  };

  const onEvents = {
    'click': (params: any) => {
      if (params.dataType === 'node') {
        window.location.href = `/graph/${params.data.name}`;
      }
    },
  };


  return (
    <ReactECharts
      ref={chartRef}
      option={option}
      style={{ height: '100%', width: '100%' }}
      onEvents={onEvents}
    />
  );
};

export default RelationChart;
