document.addEventListener('DOMContentLoaded', function () {

    // Hacemos la llamada a la API de Flask para obtener los datos
    fetch('/api/stats')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }

            // Con los datos se renderiza cada gráfico
            renderLineChart(data.lineChart.data);
            renderPieChart(data.pieChart.data);
            renderBarChart(data.barChart);
        })
        .catch(error => {
            console.error('Error al cargar los datos para los gráficos:', error);
            document.getElementById('chart-line-container').innerHTML = 'No se pudieron cargar los datos del gráfico.';
        });

    // Función para renderizar el gráfico de líneas
    function renderLineChart(data) {
        Highcharts.chart('chart-line-container', {
            chart: {
                type: 'line'
            },
            title: {
                text: 'Avisos de Adopción por Día'
            },
            xAxis: {
                type: 'datetime',
                title: {
                    text: 'Fecha'
                }
            },
            yAxis: {
                title: {
                    text: 'Cantidad de Avisos'
                },
                min: 0
            },
            series: [{
                name: 'Avisos',
                data: data
            }]
        });
    }

    // Función para renderizar el gráfico de torta
    function renderPieChart(data) {
        Highcharts.chart('chart-pie-container', {
            chart: {
                type: 'pie'
            },
            title: {
                text: 'Distribución por Tipo de Mascota'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.y}'
                    }
                }
            },
            series: [{
                name: 'Total',
                colorByPoint: true,
                data: data
            }]
        });
    }

    // Función para renderizar el gráfico de barras
    function renderBarChart(data) {
        Highcharts.chart('chart-bar-container', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Adopciones de Gatos vs. Perros por Mes'
            },
            xAxis: {
                categories: data.categories,
                title: {
                    text: 'Mes'
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Cantidad de Avisos'
                },
                stackLabels: {
                    enabled: true
                }
            },
            legend: {
                reversed: true
            },
            series: [{
                name: 'Gatos',
                data: data.gatos_data
            }, {
                name: 'Perros',
                data: data.perros_data
            }]
        });
    }
});