// Cette fonction prend les données JSON de l'API météo et extrait les températures pour la semaine
function extractTemperatureData(data) {
    var temperatureData = {
        labels: [],
        values: []
    };

    // Assume que les données de température sont disponibles dans data.hourly.temperature_2m
    for (var i = 0; i < 24; i++) {
        var temperature = data.hourly.temperature_2m[i];
        // Ajoute la température à temperatureData.values
        temperatureData.values.push(temperature);
        
        // Ajoute le temps correspondant au label (heure actuelle)
        var time = new Date(data.hourly.time[i]).toLocaleTimeString('fr-FR', { hour: 'numeric', minute: 'numeric' });
        temperatureData.labels.push(time);
    }

    return temperatureData;
}

// Déclarez une variable globale pour stocker le graphique
var myChart;

function updateTemperatureChart(data, hour, daysSkipped) {
    // Met à jour les données du tableau en fonction des choix de l'utilisateur
    putDataInTab(data, hour, daysSkipped);

    // Extrait les données de température pour la journée
    var temperatureData = extractTemperatureData(data);

    if (!myChart) {
        // Si le graphique n'existe pas, créez-le
        var ctx = document.getElementById('myChart').getContext('2d');
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: temperatureData.labels,
                datasets: [{
                    label: 'Température pour la journée à Lannion',
                    data: temperatureData.values,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } else {
        // Si le graphique existe, on met simplement à jour ses données
        myChart.data.labels = temperatureData.labels;
        myChart.data.datasets[0].data = temperatureData.values;
        myChart.update();
    }
}

function updateGraphTitle(city) {
    // Met à jour le titre du graphique
    myChart.options.plugins.title.text = 'Température pour la journée à ' + city + '';
    myChart.update();
}