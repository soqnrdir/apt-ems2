var fs = require('fs'); 
var parse = require('csv-parse');
var sqlite3 = require('sqlite3')
var moment = require('moment')

var filePath = 'data.csv'
var csvData=[];
var count = 0;
let db = new sqlite3.Database('./db/ems.db');


fs.createReadStream(filePath)
    .pipe(parse({delimiter: ','}))
    .on('data',async function(csvrow) {
        count += 1;
        if (count > 1 && count <= 50) {
            var time = new Date(csvrow[0] * 1000);
            var timeStr = moment(time).format('YYYY-MM-DD HH:mm:ss')
            var energy = Math.floor(Number(csvrow[4] * 1000))
            var power = 0
            try {
                var query = `INSERT INTO usage(time, energy, power, meterId) VALUES('${timeStr}', ${energy}, ${power}, 2)`
                console.log('query1:', query)
                await db.run(query)
                energy = Math.floor(Number(csvrow[5] * 1000))
                var query = `INSERT INTO usage(time, energy, power, meterId) VALUES('${timeStr}', ${energy}, ${power}, 3)`
                await db.run(query)
            } catch (e) {

            }
                //console.log(time, csvrow);
            //do something with csvrow
            //console.log(csvData)       
        }
    })
    .on('end',function() {

        // db.run(`INSERT INTO hUsage(time, usage, developUsage, total, sensor1, sensor2) VALUES()`, ['C'], function(err) {
        //     if (err) {
        //       return console.log(err.message);
        //     }
        //     // get the last insert id
        //   });
        
          // close the database connection
          db.close();
    
    
      //do something with csvData
      //console.log(csvData);
    });

    