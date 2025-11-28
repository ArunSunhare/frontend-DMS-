// import React, { useEffect } from 'react';
// import Highcharts from 'highcharts';
// import HighchartsReact from 'highcharts-react-official';
// import highcharts3d from 'highcharts/highcharts-3d';
// import { Users } from 'lucide-react';

// // Initialize Highcharts 3D module
// //highcharts3d(Highcharts);

// interface PieChartProps {
// statisticsChartData: {
// labels: string[];
// datasets: Array<{
// data: number[];
// backgroundColor: string | string[];
// }>;
// } | null;
// statisticsChartTitle: string;
// setSelectedStat: (stat: string) => void;
// }

// const PieChart: React.FC<PieChartProps> = ({ statisticsChartData, statisticsChartTitle, setSelectedStat }) => {
// // Detect dark mode from document class
// const isDarkMode = document.documentElement.classList.contains('dark');

// // Convert Chart.js data format to Highcharts format
// const seriesData = statisticsChartData
// ? statisticsChartData.labels.map((label, index) => ({
// name: label,
// y: statisticsChartData.datasets[0].data[index] || 0, // Default to 0 if undefined
// sliced: index === 0, // Slice out the first item for emphasis
// selected: index === 0,
// }))
// : [];

// // Determine colors based on the chart title for consistency with Monitoring
// const getChartColors = () => {
// if (statisticsChartTitle.includes('Flight Status')) {
// return ['#7C2D12', '#1D4ED8', '#16A34A']; // Planned, Active, Completed
// }
// return Array.isArray(statisticsChartData?.datasets[0].backgroundColor)
// ? statisticsChartData?.datasets[0].backgroundColor
// : [
// '#4F46E5', // Total Users - Indigo
// '#059669', // Total Drones - Emerald
// '#DC2626', // Total Flights - Red
// '#7C2D12', // Planned - Brown
// '#1D4ED8', // Active - Blue
// '#16A34A', // Completed - Green
// ];
// };

// const options = {
// chart: {
// type: 'pie',
// options3d: {
// enabled: true,
// alpha: 45, // Tilt angle for 3D effect
// beta: 10, // Slight rotation for better view
// depth: 50, // Depth of 3D effect
// },
// backgroundColor: 'transparent',
// style: {
// fontFamily: 'Arial, sans-serif',
// },
// },
// title: {
// text: statisticsChartTitle,
// style: {
// fontSize: '14px',
// color: isDarkMode ? '#e5e7eb' : '#1F2937', // text-gray-200 (dark) or text-gray-800
// },
// },
// subtitle: {
// text: 'Click a slice to view detailed distribution',
// style: {
// fontSize: '12px',
// color: isDarkMode ? '#93c5fd' : '#2563EB', // text-blue-300 (dark) or text-blue-600
// },
// },
// accessibility: {
// point: {
// valueSuffix: '',
// },
// },
// tooltip: {
// pointFormat: '{series.name}: <b>{point.y}</b>',
// backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
// style: {
// fontSize: '12px',
// color: isDarkMode ? '#ffffff' : '#000000',
// },
// },
// plotOptions: {
// pie: {
// allowPointSelect: true,
// cursor: 'pointer',
// depth: 35,
// dataLabels: {
// enabled: true,
// format: '{point.name}: {point.y}',
// style: {
// fontSize: '12px',
// color: isDarkMode ? '#e5e7eb' : '#333', // text-gray-200 (dark) or default
// },
// distance: 20,
// },
// showInLegend: true,
// },
// },
// legend: {
// align: 'right',
// verticalAlign: 'middle',
// layout: 'vertical',
// itemStyle: {
// fontSize: '12px',
// color: isDarkMode ? '#e5e7eb' : '#1F2937', // text-gray-200 (dark) or text-gray-800
// },
// itemMarginTop: 10,
// symbolWidth: 12,
// symbolHeight: 12,
// itemHoverStyle: {
// color: isDarkMode ? '#93c5fd' : '#2563EB', // text-blue-300 (dark) or text-blue-600
// },
// },
// series: [
// {
// type: 'pie',
// name: 'Statistics',
// data: seriesData,
// colors: getChartColors(),
// point: {
// events: {
// click: function (event: any) {
// setSelectedStat(event.point.name);
// },
// },
// },
// },
// ],
// credits: {
// enabled: false, // Disable Highcharts watermark
// },
// responsive: {
// rules: [
// {
// condition: {
// maxWidth: 500,
// },
// chartOptions: {
// legend: {
// align: 'center',
// verticalAlign: 'bottom',
// layout: 'horizontal',
// },
// plotOptions: {
// pie: {
// dataLabels: {
// enabled: false,
// },
// },
// },
// },
// },
// ],
// },
// };

// // Update chart colors when dark mode changes
// useEffect(() => {
// Highcharts.charts.forEach((chart) => {
// if (chart) {
// chart.update({
// title: {
// style: { color: isDarkMode ? '#e5e7eb' : '#1F2937' },
// },
// subtitle: {
// style: { color: isDarkMode ? '#93c5fd' : '#2563EB' },
// },
// tooltip: {
// backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
// style: { color: isDarkMode ? '#ffffff' : '#000000' },
// },
// legend: {
// itemStyle: { color: isDarkMode ? '#e5e7eb' : '#1F2937' },
// itemHoverStyle: { color: isDarkMode ? '#93c5fd' : '#2563EB' },
// },
// plotOptions: {
// pie: {
// dataLabels: {
// style: { color: isDarkMode ? '#e5e7eb' : '#333' },
// },
// },
// },
// });
// }
// });
// }, [isDarkMode]);

// return (
// <div className="col-span-1 ml-20px border border-gray-300  dark:border-gray-600 shadow-sm dark:bg-gray-800 rounded-lg">
// <div className="bg-gray-50 dark:bg-gray-700 p-4">
// <div className="text-gray-800 dark:text-gray-200 text-sm flex items-center space-x-2">
// <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
// <span>{statisticsChartTitle}</span>
// </div>
// <div className="text-xs text-blue-600 dark:text-blue-400">
// Click a slice to view detailed distribution
// </div>
// </div>
// <div className="p-4 flex justify-center">
// {statisticsChartData && seriesData.length > 0 && seriesData.some((d) => d.y > 0) ? (
// <div style={{ width: '100%', height: '380px', position: 'relative' }}>
// <HighchartsReact highcharts={Highcharts} options={options} />
// </div>
// ) : (
// <p className="text-gray-500 dark:text-gray-400 text-center py-20">
// No data available for selected hierarchy
// </p>
// )}
// </div>
// </div>
// );
// };

// export default PieChart;




import React, { useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highcharts3d from 'highcharts/highcharts-3d';
import { Users } from 'lucide-react';

// Initialize Highcharts 3D module
//highcharts3d(Highcharts);

interface PieChartProps {
  statisticsChartData: {
    labels: string[];
    datasets: Array<{
      data: number[];
      backgroundColor: string | string[];
    }>;
    keys?: string[]; // Optional for mapping index to key
  } | null;
  statisticsChartTitle: string;
  onSliceClick: (index: number) => void; // Updated to onSliceClick
}

const PieChart: React.FC<PieChartProps> = ({ statisticsChartData, statisticsChartTitle, onSliceClick }) => {
  // Detect dark mode from document class
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Convert Chart.js data format to Highcharts format
  const seriesData = statisticsChartData
    ? statisticsChartData.labels.map((label, index) => ({
        name: label,
        y: statisticsChartData.datasets[0].data[index] || 0, // Default to 0 if undefined
        sliced: index === 0, // Slice out the first item for emphasis
        selected: index === 0,
      }))
    : [];

  // Determine colors based on the chart title for consistency with Monitoring
  const getChartColors = () => {
    if (statisticsChartTitle.includes('Flight Status')) {
      return ['#7C2D12', '#1D4ED8', '#16A34A']; // Planned, Active, Completed
    }
    return Array.isArray(statisticsChartData?.datasets[0].backgroundColor)
      ? statisticsChartData?.datasets[0].backgroundColor
      : [
          '#4F46E5', // Total Users - Indigo
          '#059669', // Total Drones - Emerald
          '#DC2626', // Total Flights - Red
          '#7C2D12', // Planned - Brown
          '#1D4ED8', // Active - Blue
          '#16A34A', // Completed - Green
        ];
  };

  const options = {
    chart: {
      type: 'pie',
      options3d: {
        enabled: true,
        alpha: 45, // Tilt angle for 3D effect
        beta: 10, // Slight rotation for better view
        depth: 50, // Depth of 3D effect
      },
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'Arial, sans-serif',
      },
    },
    title: {
      text: statisticsChartTitle,
      style: {
        fontSize: '14px',
        color: isDarkMode ? '#e5e7eb' : '#1F2937', // text-gray-200 (dark) or text-gray-800
      },
    },
    subtitle: {
      text: 'Click a slice to view detailed distribution',
      style: {
        fontSize: '12px',
        color: isDarkMode ? '#93c5fd' : '#2563EB', // text-blue-300 (dark) or text-blue-600
      },
    },
    accessibility: {
      point: {
        valueSuffix: '',
      },
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y}</b>',
      backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
      style: {
        fontSize: '12px',
        color: isDarkMode ? '#ffffff' : '#000000',
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        depth: 35,
        dataLabels: {
          enabled: true,
          format: '{point.name}: {point.y}',
          style: {
            fontSize: '12px',
            color: isDarkMode ? '#e5e7eb' : '#333', // text-gray-200 (dark) or default
          },
          distance: 20,
        },
        showInLegend: true,
      },
    },
    legend: {
      align: 'right',
      verticalAlign: 'middle',
      layout: 'vertical',
      itemStyle: {
        fontSize: '12px',
        color: isDarkMode ? '#e5e7eb' : '#1F2937', // text-gray-200 (dark) or text-gray-800
      },
      itemMarginTop: 10,
      symbolWidth: 12,
      symbolHeight: 12,
      itemHoverStyle: {
        color: isDarkMode ? '#93c5fd' : '#2563EB', // text-blue-300 (dark) or text-blue-600
      },
    },
    series: [
      {
        type: 'pie',
        name: 'Statistics',
        data: seriesData,
        colors: getChartColors(),
        point: {
          events: {
            click: function (event: any) {
              // Call the parent's onSliceClick with the index
              onSliceClick(event.point.index);
            },
          },
        },
      },
    ],
    credits: {
      enabled: false, // Disable Highcharts watermark
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            legend: {
              align: 'center',
              verticalAlign: 'bottom',
              layout: 'horizontal',
            },
            plotOptions: {
              pie: {
                dataLabels: {
                  enabled: false,
                },
              },
            },
          },
        },
      ],
    },
  };

  // Update chart colors when dark mode changes
  useEffect(() => {
    Highcharts.charts.forEach((chart) => {
      if (chart) {
        chart.update({
          title: {
            style: { color: isDarkMode ? '#e5e7eb' : '#1F2937' },
          },
          subtitle: {
            style: { color: isDarkMode ? '#93c5fd' : '#2563EB' },
          },
          tooltip: {
            backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
            style: { color: isDarkMode ? '#ffffff' : '#000000' },
          },
          legend: {
            itemStyle: { color: isDarkMode ? '#e5e7eb' : '#1F2937' },
            itemHoverStyle: { color: isDarkMode ? '#93c5fd' : '#2563EB' },
          },
          plotOptions: {
            pie: {
              dataLabels: {
                style: { color: isDarkMode ? '#e5e7eb' : '#333' },
              },
            },
          },
        });
      }
    });
  }, [isDarkMode]);

  return (
    <div className="col-span-1 ml-5 border border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-800 rounded-lg">
      <div className="bg-gray-50 dark:bg-gray-700 p-4">
        <div className="text-gray-800 dark:text-gray-200 text-sm flex items-center space-x-2">
          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>{statisticsChartTitle}</span>
        </div>
        <div className="text-xs text-blue-600 dark:text-blue-400">
          Click a slice to view detailed distribution
        </div>
      </div>
      <div className="p-4 flex justify-center">
        {statisticsChartData && seriesData.length > 0 && seriesData.some((d) => d.y > 0) ? (
          <div style={{ width: '100%', height: '380px', position: 'relative' }}>
            <HighchartsReact highcharts={Highcharts} options={options} />
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-20">
            No data available for selected hierarchy
          </p>
        )}
      </div>
    </div>
  );
};

export default PieChart;







