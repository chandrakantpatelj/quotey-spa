import React from 'react'
import { useTheme } from '@mui/material/styles'
import ReactApexcharts from 'src/@core/components/react-apexcharts'
// import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
const series = [80, 78, 56]

const CustomerChart = () => {
  const theme = useTheme()

  const options = {
    chart: {
      id: 'customers-chart',
      toolbar: { show: false }
    },

    legend: {
      show: true,
      position: 'top',
      onItemClick: {
        toggleDataSeries: false
      },
      onItemHover: {
        highlightDataSeries: false
      },
      fontSize: '12px',
      markers: {
        width: 10,
        height: 10,
        strokeWidth: 0,
        strokeColor: '#000',
        radius: 12,
        offsetX: 0,
        offsetY: 0
      }
      // labels: {
      //   useSeriesColors: true
      // }
    },
    colors: ['#FB8072', '#DEA966', '#157AFE'],

    plotOptions: {
      radialBar: {
        hollow: {
          margin: 5,
          size: '90%',
          background: 'transparent'
        },
        hollow: {
          margin: 0,
          size: '50%'
        },
        track: {
          show: true,
          strokeWidth: '100%'
        },
        customLegendItems: ['gtrty', 'hfghfg', 'hfgh'],
        dataLabels: {
          name: {
            fontSize: '22px'
          },
          value: {
            fontSize: '16px'
          },
          total: {
            show: true,
            label: 'Total',
            formatter: function (w) {
              const total =
                w.globals.seriesTotals.reduce((a, b) => {
                  return a + b
                }, 0) /
                  w.globals.series.length +
                '%'
              return parseInt(total || 0, 10)
            }
          }
        }
      }
    },
    labels: ['Current Customer', 'New Customer', 'Retargeted Customer']
  }

  return (
    <>
      <ReactApexcharts options={options} series={series} type='radialBar' height={240} />{' '}
    </>
  )
}

export default CustomerChart

// https://apexcharts.com/docs/formatting-axes-labels/
