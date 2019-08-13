var currentData = []

var fromDate = new Date('2018-01-01')
var toDate = new Date('2018-12-31')

var chartFunctions = []

var dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
};

var language;
if (window.navigator.languages) {
    language = window.navigator.languages[0];
} else {
    language = window.navigator.userLanguage || window.navigator.language;
}

function updateCharts() {
    var data = currentData.filter((item) =>
        (fromDate == null || item.StörBeginn.getTime() >= fromDate.getTime()) &&
        (toDate == null || item.StörBeginn.getTime() <= toDate.getTime())
    );
    try {
        chartFunctions.forEach(fun => fun(data))
    } catch (err) {
        console.log("Error: " + err)
    }
}

function loadNewData(toLoad) {
    var cleaned = toLoad.map(record => ({
        ...record,
        StörBeginn: record.StörBeginn ? new Date(record.StörBeginn) : new Date(record.Meldungsdatum)
    }))
    currentData = cleaned
    updateCharts()
}
loadNewData(rawData)


//* Start Slider *//  
$(function () {
    function update() {
        fromDate = new Date($("#slider-range").slider("values", 0) * 1000)
        toDate = new Date($("#slider-range").slider("values", 1) * 1000)
        document.getElementById("amount").innerHTML = fromDate.toLocaleDateString(language, dateOptions) + " - " + toDate.toLocaleDateString(language, dateOptions);
        updateCharts()
    }
    $("#slider-range").slider({
        range: true,
        min: new Date('2018-01-01').getTime() / 1000,
        max: new Date('2018-12-31').getTime() / 1000,
        step: 86400,
        values: [fromDate.getTime() / 1000, toDate.getTime() / 1000],
        slide: update
    });
    $("#q1").click(() => {
        $("#slider-range").slider("values", 0, new Date('2018-01-01').getTime() / 1000)
        $("#slider-range").slider("values", 1, new Date('2018-03-31').getTime() / 1000)
        update()
    })
    $("#q2").click(() => {
        $("#slider-range").slider("values", 0, new Date('2018-04-01').getTime() / 1000)
        $("#slider-range").slider("values", 1, new Date('2018-06-30').getTime() / 1000)
        update()
    })
    $("#q3").click(() => {
        $("#slider-range").slider("values", 0, new Date('2018-07-01').getTime() / 1000)
        $("#slider-range").slider("values", 1, new Date('2018-09-30').getTime() / 1000)
        update()
    })
    $("#q4").click(() => {
        $("#slider-range").slider("values", 0, new Date('2018-10-01').getTime() / 1000)
        $("#slider-range").slider("values", 1, new Date('2018-12-31').getTime() / 1000)
        update()
    })
    $("#q5").click(() => {
        $("#slider-range").slider("values", 0, new Date('2018-01-01').getTime() / 1000)
        $("#slider-range").slider("values", 1, new Date('2018-12-31').getTime() / 1000)
        update()
    })
    document.getElementById("amount").innerHTML = new Date($("#slider-range").slider("values", 0) * 1000).toLocaleDateString(language, dateOptions) + " - " + new Date($("#slider-range").slider("values", 1) * 1000).toLocaleDateString(language, dateOptions);
});
//* Ende Slider *//


//* Start Pie Chart Grafik *//
function addStoerungsKategorie() {
    var chart = c3.generate({
        bindto: "#piechart",
        data: {
            columns: [
            ['Unkritisch: Reparatur planen', 1000],
            ['Fehler: Reparatur nötig', 300],
            ['Gravierend: Infrastruktur eingeschalten', 200],
            ['Schwer: Infrastruktur gesperrt', 700],
            ['Irrelevant: Keine Auswirkung', 600],
        ],
            type: 'pie',
            onclick: function (d, i) {},
            onmouseover: function (d, i) {},
            onmouseout: function (d, i) {},

        },
        color: {
            pattern: ['#7DC719', '#C6C819', '#C95C18', '#CB1742', 'CFE3C4', '#999999']
        }
    });
    return (records) => {
        var fehlerkategorie = records.map(record => record["FehlerKat."] || "&")
        var werte = {}
        fehlerkategorie.forEach(e => werte[e] = (werte[e] | 0) + 1)
        chart.load({
            columns: [
                ['Unkritisch: Reparatur planen', werte["D"] || 0],
                ['Fehler: Reparatur nötig', werte["C"] || 0],
                ['Gravierend: Infrastruktur eingeschalten', werte["B"] || 0],
                ['Schwer: Infrastruktur gesperrt', werte["A"] || 0],
                ['Irrelevant: Keine Auswirkung', werte["X"] || 0]],
        })
    }
}
//* Ende Pie Chart Grafik *//
chartFunctions.push(addStoerungsKategorie())


//* Start Anteil Grafik *//
function addAnteilGeplanteStoerung() {
    var chart = c3.generate({
        bindto: "#gaugechart",
        data: {
            columns: [
            ['Anteil geplanter Störungen', 0]
        ],
            type: 'gauge',
            onclick: function (d, i) {
                console.log("onclick", d, i);
            },
            onmouseover: function (d, i) {
                console.log("onmouseover", d, i);
            },
            onmouseout: function (d, i) {
                console.log("onmouseout", d, i);
            }
        },
        gauge: {
            //        label: {
            //            format: function(value, ratio) {
            //                return value;
            //            },
            //            show: false // to turn off the min/max labels.
            //        },
            //    min: 0, // 0 is default, //can handle negative min e.g. vacuum / voltage / current flow / rate of change
            //    max: 100, // 100 is default
            //    units: ' %',
            width: 30 // for adjusting arc thickness
        },
        color: {
            pattern: ['#CB1742', '#CA171C', '#CA3717', '#C95C18', '#C98118', '#C8A618', '#C6C819', '#A1C719', '#7DC719', '#58C71A'], // the three color levels for the percentage values.
            threshold: {
                //            unit: 'value', // percentage is default
                //            max: 200, // 100 is default
                values: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]
            }
        },
        size: {
            //       height: 180
        }

    });
    return (records) => {
        var mitStoerung = records.filter(record => record.Geplant == 1)
        anteil = mitStoerung.length / records.length
        chart.load({
            columns: [["Anteil geplanter Störungen", anteil * 100]]
        })
    }
}

chartFunctions.push(addAnteilGeplanteStoerung())

//* Ende Anteil Grafik *//


//*Start total *//

function addtotal() {
    return (records) => {
        document.getElementById('total').innerHTML = records.length;
    }
}
chartFunctions.push(addtotal())

//*Ende total*//


//*Start dauer *//
function adddauer() {
    // toFixed für zwei Nachkommastellen
    return (records) => {
        document.getElementById('dauer').innerHTML = records.map(e => e["StörungsdauerStd"]).reduce((a, b) => a + b, 0).toFixed(2);
    }
}
chartFunctions.push(adddauer())
//*Ende dauer*//


//* Start bar chart Grafik *//
function addwochentag() {
    var chart = c3.generate({
        bindto: '#barchart',
        data: {
            x: 'x',
            columns: [
                ['x', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'],
                ['Anzahl Störungen', 6, 8, 6, 5, 4, 16, 9]
            ],
            type: 'bar',

        },
        axis: {
            x: {
                type: 'category'
            },
            y: {

            }
        },
        color: {
            pattern: ['#CE375A', '#CE375A', '#D25873', '#D5788C', '#D999A5', '#DCB9BE', '#E0DAD7']
//          pattern: ['#CB1742', '#CE375A', '#D25873', '#D5788C', '#D999A5', '#DCB9BE', '#E0DAD7']
        }
    });
    return (records) => {
        var wochentage = records.map(record => record["Wochentag"])
        var werte = {}
        wochentage.forEach(e => werte[e] = (werte[e] | 0) + 1)
 chart.load({
            columns: [
                ['Anzahl Störungen', 
                    werte["Montag"] || 0,
                    werte["Dienstag"] || 0,
                    werte["Mittwoch"] || 0,
                    werte["Donnerstag"] || 0,
                    werte["Freitag"] || 0,
                    werte["Samstag"] || 0,
                    werte["Sonntag"] || 0]
            ]
        })
    }
}
chartFunctions.push(addwochentag())
//* Ende bar chart Grafik *//


//* Start timeseries  Grafik *//
function addKumuliert() {
    var chart = c3.generate({
        bindto: "#timeseries",
        data: {
            x: 'x',
            //        xFormat: '%Y%m%d', // 'xFormat' can be used as custom format of 'x'
            columns: [
            ['x', '2018-01-01', '2018-02-01', '2018-03-01', '2018-04-01', '2018-05-01', '2018-06-01', '2018-12-01'],
            ['Kumulierte Anzahl Störungen', 30, 100, 150, 300, 330, 400, 3, 1],
        ]
        },
        axis: {
            x: {
                type: 'timeseries',
                tick: {
                    format: '%d.%m.%Y'
                }
            }
        },
        regions: [
            {
                axis: 'x',
                start: '2018-02-01',
                end: '2018-04-01',
                class: 'regionX',
            },
    ],
        color: {
            pattern: ['#CB1742']
        },
        zoom: {
            enabled: true
        }
    });
    return (records) => {
        var dates = [];
        for (var d = new Date('2018-01-01'); d <= new Date('2018-12-31'); d.setDate(d.getDate() + 4)) {
            dates.push(new Date(d));
        }
        console.log(['x', ...dates.map(d => d.toISOString().slice(0, 10))])

        var stoerungsdatum = currentData.map(record => record.StörBeginn ? new Date(record.StörBeginn) : new Date(record.Meldungsdatum))
        var counts = dates.map(d => stoerungsdatum.filter(sd => sd <= d).length)

        chart.load({
            columns: [
                ['x', ...dates.map(d => d.toISOString().slice(0, 10))],
                ['Kumulierte Anzahl Störungen', ...counts],
            ]
        })
        chart.regions([{
            axis: 'x',
            start: fromDate.toISOString().slice(0, 10),
            end: toDate.toISOString().slice(0, 10),
            class: 'regionX',
        }])
    }
}
chartFunctions.push(addKumuliert())
//* Ende timeseries  Grafik *//

$(() => updateCharts())
