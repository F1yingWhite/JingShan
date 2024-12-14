import React, { useEffect, useState, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { Graph } from '@/lib/graph_zhi';

type RelationChartProps = {
  graph: Graph;
  layout: "force" | "circular" | "none";
  emphasis: boolean;
  zoom: number
};

const RelationChart: React.FC<RelationChartProps> = ({ graph, layout, emphasis, zoom }) => {
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
          edgeLength: 50
        } : undefined,
        draggable: true,
        circular: {
          rotateLabel: true
        },
        zoom: zoom,
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
              return params.data.value > 4 ? params.data.name : "";
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
        emphasis: emphasis ? {
          focus: 'adjacency',
          lineStyle: {
            width: 10
          }
        } : {}
      }
    ]
  };

  const onEvents = {
    'click': (params: any) => {
      if (params.dataType === 'node') {
        if (params.data.url)
          window.location.href = `${params.data.url}`;
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
