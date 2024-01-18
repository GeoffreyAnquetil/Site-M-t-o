// URL de l'API météo pour Lannion, température température apparente, rain, showers, snowfall 
var apiURL1 = "https://api.open-meteo.com/v1/forecast?latitude=48.73&longitude=-3.46&hourly=temperature_2m,weathercode,windspeed_10m&past_days=31"
// URL de l'API du gouvernement pour avoir des coordonnées en fonction du nom de la ville 
var apiURL2;
// Le tableau du document html
let theTableElement;
// Nombre de jours passées depuis le 1er du json de l'api 1 (31 jours avant la date actuelle), permet de changer de jour affiché
let daysSkipped = 31;
// Heure affichée sur le site, initialisée à minuit
let hour = 0;
// Coordonnées de la ville rentrée par l'utilisateur.
let xCoord;
let yCoord;
// Ville rentrée par l'utilisateur (initialisée à Le Havre par pur chauvinisme)
let city = "Le Havre";

// On attend que le DOM soit entièrement chargé pour lancer init
window.addEventListener("DOMContentLoaded", init);

/*  Procédure ne prenant rien en argument et initialisant les différents boutons du site 
	Un premier fetch vers l'URL1 est effectué afin de récupérer les données importantes
	à l'affichage du site */
function init(){
	theTableElement = document.getElementById("theTable");	// On accède à l'élément HTML d'id 'theTable' via la variable theTableElement
	let buttonUpdate = document.getElementById("btnUpdate");  // idem pour le bouton Actualiser d'id "btnUpdate"
	buttonUpdate.addEventListener("click", updateTab);  // La fonction updateTab se lance lorsque l'utilisateur clique sur le bouton Actualiser
	let buttonNext = document.getElementById("btnNext");  // idem pour le bouton Next et la fonction nextDay
	buttonNext.addEventListener("click", nextDay);
	let buttonPrevious = document.getElementById("btnPrevious");  // idem pour le bouton Next et la fonction nextDay
	buttonPrevious.addEventListener("click", previousDay);
	fetch(apiURL1)
        .then((response) => response.json())
        .then((data) => {
            putDataInTab(data, hour, daysSkipped);
            updateTemperatureChart(data, hour, daysSkipped);
        })
        .catch((error) => console.error('Erreur lors du chargement des données :', error));
	
}

/*  Procédure prenant en argument :
		- data : un élément json renvoyé par le premier API
		- heure : un entier représentant l'heure choisie par l'utilisateur
		- joursSkipped : un entier représentant la date choisie par l'utilisateur telle que la date = Jour actuel - 31 + joursSkipped
	et ayant pour effet :
		- Mise à jour du tableau avec les données rentrées par l'utilisateur (ou par défaut) */ 
function putDataInTab(data,heure,joursSkipped){
	//
	deleteTab();  // Le tableau actuel est supprimé
	createEmptyTab(); // Les titres des colonnes sont re créees
	updateTabTitle(); // On change le titre du tableau pour être en adéquation avec la ville choisie

	var h = heure + joursSkipped*24; // h est une variable permettant de se placer au bon indice dans le json 

	const temp = data.hourly.temperature_2m[h];  // Déclaration de temp et affectation à la valeur de la température demandée par l'utilisateur (en str)
	const temp_unit = data.hourly_units.temperature_2m; // Déclaration de temp_unit et affectation à l'unité de température (en str)
	const weathercode = data.hourly.weathercode[h];  // Déclaration et affectation de weathercode au code météo (en str)
	const wind = data.hourly.windspeed_10m[h];  // Déclaration et affectation de wind à la vitesse du vent (en str)
	const wind_unit = data.hourly_units.windspeed_10m;  // Déclaration et affectation de wind_unit à l'unité de la vitesse du vent (en str)
	var date = data.hourly.time[h].split("T")[0];  /* Déclaration et affectation de date à la date actuelle en splitant l'élément data.hourly.time[h
													  car initialement au format AAAA-MM-JJT00:00 avec 00:00 l'heure*/
	date = convertDate(date);  // convertion de la date du format AAAA-MM-JJ au format JJ Mois AAAA

	var hour = data.hourly.time[h].split("T")[1]; // Similaire à date pour l'heure cette fois ci
	hour = convertHour(hour);  // convertion de l'heure du format 00:00 au format 00h00
	// Création et stockage dans newTableRow d'une rangée de tableau dans le HTML
	const newTableRow = document.createElement('tr');
	// Création et stockage dans newTableDivDate d'un élément de la rangée newTableRow
	const newTableDivDate = document.createElement('td');
	newTableDivDate.innerText = date; // Dont le texte sera la variable date
	newTableRow.appendChild(newTableDivDate); // On raccroche cette élément à la rangée newTableRow
	// On fait de même pour l'heure
	const newTableDivHour = document.createElement('td');
	newTableDivHour.innerText = hour;
	newTableRow.appendChild(newTableDivHour);
	// On fait de même pour la température
	const newTableDivTemperature = document.createElement('td');
	newTableDivTemperature.innerText = temp + temp_unit;
	newTableRow.appendChild(newTableDivTemperature);
	// On fait de même pour le vent
	const newTableDivWind = document.createElement('td');
	newTableDivWind.innerText = wind + wind_unit;
	newTableRow.appendChild(newTableDivWind);
	// On fait de même pour le temps qu'il fait
	const newTableDivWeathercode = document.createElement('td');
	newTableDivWeathercode.innerHTML = "<img src='" + convertWCtoIMG(weathercode) + "'>"; // Subtilité ici où la case du tableau ne sera pas un texte mais une IMG
	newTableRow.appendChild(newTableDivWeathercode);
	// On raccroche la newTableRow au tableau du HTML
	theTableElement.appendChild(newTableRow);
}

/* Prend une date sous la forme AAAA-MM-JJ et la met sous la forme 
JJ Mois AAAA*/
function convertDate(date){
	var output; // Variable renvoyée en fin de fonction
	var day = date.split("-")[2]; // On récupère ce qui correspond au jour
	var year = date.split("-")[0]; // On récupère ce qui correspond à l'année
	var month = date.split("-")[1]; // On récupère ce qui correspond au mois
	switch(month){ // On convertie MM en Mois
		case "01" : month = "Janvier"; break ;
		case "02" : month = "Février"; break ;
		case "03" : month = "Mars"; break ;
		case "04" : month = "Avril"; break ;
		case "05" : month = "Mai"; break ;
		case "06" : month = "Juin"; break ;
		case "07" : month = "Juillet"; break ;
		case "08" : month = "Aout"; break ;
		case "09" : month = "Septembre"; break ;
		case "10" : month = "Octobre"; break ;
		case "11" : month = "Novembre"; break ;
		case "12" : month = "Décembre";  break ;
	}
	output = day + " " + month + " " + year; // On arrange au format "Jour Mois Année"
	return output;  // On renvoie le résultat
}

// Prend un horaire sous forme XX:XX et la met sous format XXhXX
function convertHour(heure){
	var output = heure.split(":")[0] + "h" + heure.split(":")[1]; // On arrange au format "XXhXX"
	return output;
}

/*  Procédure ne prenant aucun argument en entrée et ayant pour effet de mettre à jour le tableau en prenant en compte les choix effectués par
	l'utilisateur */
	function updateTab() {
		hour = document.getElementById("hour-selector").value;
		hour = parseInt(hour);
		city = document.getElementById("input_text").value;
		apiURL2 = "https://api-adresse.data.gouv.fr/search/?q=" + city;
		fetch(apiURL2)
			.then((response) => response.json())
			.then((data) => {
				getCoord(data);
				updateURL1(xCoord, yCoord);
			})
			.then(() => {
				fetch(apiURL1)
					.then((response) => response.json())
					.then((data) => updateTemperatureChart(data, hour, daysSkipped))
			});
	}
	
	// Cette fonction est appelée pour mettre à jour le graphique lorsque le bouton Actualiser est cliqué
	function updateTemperatureChart(data, hour, daysSkipped) {
		// Met à jour les données du tableau en fonction des choix de l'utilisateur
		putDataInTab(data, hour, daysSkipped);
	
		// Extrait les données de température pour la journée
		var temperatureData = extractTemperatureData(data);
	
		// Affiche le graphique des températures pour la journée
		displayTemperatureChart(temperatureData);
	}
	

/*  Procédure ne prenant aucun argument en entrée et ayant pour effet de supprimer l'intérieur du tableau HTML */
function deleteTab(){
	var tab = document.getElementById("theTable"); // On récupère et stock dans tab l'élément HTML d'id "theTable"
	while(tab.firstChild){  // Tant qu'il y a des éléments liés à tab dans son arborescence
		tab.removeChild(tab.firstChild);  // On les supprime
	}
}

/*  Procédure ne prenant aucun argument en entrée et ayant pour effet de créer le titre des différentes collonnes du tableau HTML */
function createEmptyTab(){
	theTableElement = document.getElementById("theTable"); 
	const newTableRow = document.createElement('tr');  
	// Création et stockage dans newTableTHDate d'un élément de la rangée newTableRow
	const newTableTHDate = document.createElement('th');
	newTableTHDate.innerText = "Date"; // Dont le texte sera le titre "Date"
	newTableRow.appendChild(newTableTHDate); // Et que l'on raccroche à la ligne de tableau newTableRow
	// De même pour la colonne Heure
	const newTableTHHour = document.createElement('th');
	newTableTHHour.innerText = "Heure";
	newTableRow.appendChild(newTableTHHour);
	// De même pour la colonne Température
	const newTableTHTemperature = document.createElement('th');
	newTableTHTemperature.innerText = "Température";
	newTableRow.appendChild(newTableTHTemperature);
	// De même pour la colonne Vent
	const newTableTHWind = document.createElement('th');
	newTableTHWind.innerText = "Vent";
	newTableRow.appendChild(newTableTHWind);
	// De même pour la colonne Temps
	const newTableTHWeathercode = document.createElement('th');
	newTableTHWeathercode.innerText = "Temps";
	newTableRow.appendChild(newTableTHWeathercode);
	// On raccroche la ligne newTableRow au tableau theTableElement
	theTableElement.appendChild(newTableRow);
}

/*  Procédure prenant en argument :
		- data en json : les données récupérées via l'api 2 
	Récupère les données en latitude et longitude de la ville écrite par l'utilisateur via l'api 2 */
function getCoord(data){
	xCoord = data.features[0].geometry.coordinates[0];
	yCoord = data.features[0].geometry.coordinates[1];
}

/*  Procédure prenant en argument :
		- xCoord en int : coordonnée en latitude de la ville écrite par l'utilisateur
		- yCoord en int : coordonnée en longitude de la ville écrite par l'utilisateur 
	Modifie l'URL1 aux bonnes coordonnées géographique de la ville écrite par l'utilisateur*/
function updateURL1(xCoord, yCoord){
	apiURL1 = "https://api.open-meteo.com/v1/forecast?latitude=" + yCoord + "&longitude=" + xCoord + "&hourly=temperature_2m,weathercode,windspeed_10m&past_days=31";
}

/*  Procédure sans argument en entrée
	Modifie le titre du tableau pour correspondre à la ville écrite par l'utilisateur*/
function updateTabTitle(){
	var title = document.getElementById("tabTitle");
	title.innerText = "Météo à " + city;
}

/*  Procédure sans argument
	Avance de 1 jour la date des information météo récupérées dans l'api 1 et actualise le tableau*/
function nextDay(){
	daysSkipped = daysSkipped + 1;
	updateTab();
}

/*  Procédure sans argument
	Recule de 1 jour la date des information météo récupérées dans l'api 1 et actualise le tableau*/
function previousDay(){
	daysSkipped = daysSkipped - 1;
	updateTab();
}

/*  Procédure prenant en argument :
		- wCode : un entier représentant le temps qu'il fait à une heure et des coordonnées précises
	Renvoie l'arborescence permettant d'accéder à l'image correspondant au temps codé par le weathercode*/
function convertWCtoIMG(wCode){
	var tmpIMG;
	switch(wCode){
		case 0 : tmpIMG = "./asset/weather_images/clear.png"; break;
		case 1 : tmpIMG = "./asset/weather_images/few_clouds.png"; break;
		case 2 : tmpIMG = "./asset/weather_images/clouds.png"; break;
		case 3 : tmpIMG = "./asset/weather_images/clouds.png"; break;
		case 45 : tmpIMG = "./asset/weather_images/fog.png"; break;
		case 48 : tmpIMG = "./asset/weather_images/fog.png"; break;
		case 51 : tmpIMG = "./asset/weather_images/drizzle.png"; break;
		case 53 : tmpIMG = "./asset/weather_images/drizzle.png"; break;
		case 55 : tmpIMG = "./asset/weather_images/drizzle.png"; break;
		case 56 : tmpIMG = "./asset/weather_images/drizzle.png"; break;
		case 57 : tmpIMG = "./asset/weather_images/drizzle.png"; break;
		case 61 : tmpIMG = "./asset/weather_images/rain.png"; break;
		case 63 : tmpIMG = "./asset/weather_images/rain.png"; break;
		case 65 : tmpIMG = "./asset/weather_images/rain.png"; break;
		case 66 : tmpIMG = "./asset/weather_images/rain.png"; break;
		case 67 : tmpIMG = "./asset/weather_images/rain.png"; break;
		case 71 : tmpIMG = "./asset/weather_images/snow.png"; break;
		case 73 : tmpIMG = "./asset/weather_images/snow.png"; break;
		case 75 : tmpIMG = "./asset/weather_images/snow.png"; break;
		case 77 : tmpIMG = "./asset/weather_images/snow.png"; break;
		case 80 : tmpIMG = "./asset/weather_images/heavy_rain.png"; break;
		case 81 : tmpIMG = "./asset/weather_images/heavy_rain.png"; break;
		case 82 : tmpIMG = "./asset/weather_images/heavy_rain.png"; break;
		case 85 : tmpIMG = "./asset/weather_images/snow.png"; break;
		case 86 : tmpIMG = "./asset/weather_images/snow.png"; break;
	}
	return tmpIMG;
}
