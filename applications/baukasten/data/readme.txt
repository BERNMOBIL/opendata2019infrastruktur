DATEN
	Stoerungen_Meldeliste.csv
		Ursprüngliche Rohdaten von Bernmobil
	Mapping_Fehlerkategorie.csv
		zusätzliche Informationen zur Störungskategorie
	MappingTechnischeIdentitatsnummer.csv
		zusätzliche Infos zu den Störungen. Diese Daten habe ich aus verschiedenen Zusatzdaten von Bernmobil zusammengetragen.
	BernmobilStoerungen2018.csv
		Meine bereinigten und gemappten Daten. Dazu habe ich auch das Skript "converter.html" gebraucht, welches Daten mappen kann. Mehr zu diesem Skript in den nächsten Abschnitten.

ALLGEMEINE INFOS ZU CONVERTER.HTML
	Oben Störungsdaten-CSV einfügen. Unten Technische Identitätsnummer-CSV einfügen.
	Eingegebene Befehle werden auf den Input angewendet und als Output in der Mitte ausgegeben. 
	Vor dem nächsten Befehl unbedingt "Use Output as Input" anklicken, um den Input zu aktualisieren.

STÖRUNGSDAUER

	1;StörBeginn;StörungsBegZt;beginn
	Störungsbeginn ausrechnen als UNIX-Timestamp und in neue Spalte beginn speichern

	1;Störungsende;StörungsEndZt;ende
	Störungsende ausrechnen als UNIX-Timestamp und in neue Spalte ende speichern

	2;ende;beginn;dauer
	Differenz in Millisekunden zwischen ende und beginn ausrechnen und in neue Spalte dauer speichern
	
TECHNISCHE IDENTNR.

	4;Tech.Identnr.;Techn. Ident;Traktion;Traktion
	Spalte Original CSV, Spalte Mapping CSV (unten), der Wert in der Spalte Traktion im Mapping CSV wird in die neue Spalte Traktion geschrieben
	
	4;Tech.Identnr.;Techn. Ident;Bez.;Bez.
	
	4;Tech.Identnr.;Techn. Ident;Ort;Ort
	
Der Converter fügt dem CSV einige Spalten an, andere werden nicht mehr gebraucht. Diese lassen sich z.B. mit LibreOffice Calc einfach entfernen. Die Spalte dauer ist in Millisekunden. Dies sollte auch noch umgerechnet werden, z.B. in Minuten.