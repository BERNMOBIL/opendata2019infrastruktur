/**
* this is some additional data, which is used for dynamic mapping
*/

// additional data for the columns
var columnInfo = {
	"Dauer (in Std.)": {
			mappingFunction: d3.scaleThreshold()
						.domain([0.001, 5, 24])
						.range(["ohne Zeitangabe","kurz", "mittel", "lang"]),
			descriptionString: function(d) {
				return {
					"ohne Zeitangabe" : "",
					"kurz" : "dauerte bis zu 5 Stunden",
					"mittel": "dauerte 5 - 24 Stunden",
					"lang": "dauerte länger als 24 Stunden"
				} [d];
			}
		},
	"Störungsbeginn": {
			mappingFunction: function(d) {
				if(d != "") {
					var months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
					var month = parseInt(d.split(".")[1]) - 1;
					return months[month];
				} else {
					return "";
				}
			},
		},
	"Fehlerkategorie" : {
			valueString: function(d) {
				return {
					"&" : "Nicht bestimmt",
					"A" : "Schwer",
					"B" : "Gravierend",
					"C" : "Fehler",
					"D" : "Unkritisch",
					"X": "Irrelevant",
				} [d];
			},
			descriptionString: function(d) {
				return {
					"&" : "",
					"A" : "Infrastruktur gesperrt",
					"B": "Infrastruktur eingeschalten",
					"C": "Reparatur nötig",
					"D": "Reparatur planen",
					"X": "keine Auswirkungen, z.B. präventive Instandhaltung"
				} [d];
			}
		},
	"Traktion" : {
			valueString: function(d) {
				return {
					"Tr" : "Tram",
					"Tb" : "Trolleybus",
					"" : "nicht angegeben",
				} [d];
			},
		},
};

// icons for the columns
var iconInfo = {
	"Fehlerkategorie" : { 
		icon:"./icons/severity.png",
	},
	"Fehlertext" : { 
		icon:"./icons/details.png",
	},
	"Ursache" : {
		icon:"./icons/idea.png",
	},
	"Dauer (in Std.)" : {
		icon:"./icons/duration.png",
	},
	"Anlagenart" : {
		icon:"./icons/infrastructure.png",
	},
	"Traktion" : {
		icon:"./icons/traction.png",	
	},
	"Ort" : {
		icon:"./icons/location.png",
	},
	"Massnahme" : {
		icon:"./icons/action.png",
	},
	"Störungsbeginn" : {
		icon:"./icons/calendar.png",
	},
}