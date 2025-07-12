import ReactApexcharts from 'src/@core/components/react-apexcharts'

const PendingInvoicesChart = ({ data, currency }) => {
  const currentFySales = data.filter(item => item.key.startsWith('current_fy_monthly_sale'))
  const prevFySales = data.filter(item => item.key.startsWith('previous_fy_monthly_sale'))

  currentFySales.sort((a, b) => {
    const monthA = parseInt(a.key.split('_')[4], 10)
    const monthB = parseInt(b.key.split('_')[4], 10)
    return monthA - monthB
  })

  prevFySales.sort((a, b) => {
    const monthA = parseInt(a.key.split('_')[4], 10)
    const monthB = parseInt(b.key.split('_')[4], 10)
    return monthA - monthB
  })

  // Extract month names for x-axis
  const labels = currentFySales.map(item => item.key.split('_').pop())

  const series = [
    {
      name: 'Current Financial Year',
      data: currentFySales.map(item => item.value)
    },
    {
      name: 'Previous Financial Year',
      data: prevFySales.map(item => item.value)
    }
  ]

  const options = {
    chart: {
      id: 'sales-figure',
      type: 'line',
      toolbar: { show: false }
    },
    colors: ['#157AFE', '#FB8072'],
    legend: {
      show: true,
      position: 'top'
    },
    stroke: {
      curve: 'straight',
      width: 2
    },
    grid: {
      show: true,
      borderColor: '#dbdbdb',
      strokeDashArray: 5
    },
    xaxis: {
      categories: labels
    },
    yaxis: {
      show: true,
      tickAmount: 4,
      labels: {
        show: true,
        formatter: val => `${currency?.symbol} ${val}`
        // formatter: val => <NumberFormat value={val} currency={currency} />
      }
    },
    dataLabels: {
      enabled: false
    },
    noData: {
      text: 'No data available',
      align: 'center',
      verticalAlign: 'middle',
      offsetX: 0,
      offsetY: 0,
      style: {
        fontSize: '16px',
        fontWeight: 500
      }
    }
  }

  return <ReactApexcharts options={options} series={series} height={300} />
}

export default PendingInvoicesChart
