'use strict'
//dependencies
const dotenv = require('dotenv').config();
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

//routes
app.get('/', mainPageHandler);
app.post('/getCountryResult', newSearchHandler);
app.get('/allCountries', allCountriesHandler)
app.get('/country/:id', countryDetailsHandler)
app.post('/addCountry', addCountryHandler)
app.get('/myRecords', myRecordsHandler);
app.delete('/deleteCountry/:id', deleteCountry);
app.put('/updateCountry/:id', updateCountry);








//functions
function mainPageHandler(req, res) {
    let url = `https://api.covid19api.com/world/total`;
    superagent.get(url).then((results) => {
        res.render('pages/index', { data: results.body })
    })
}

function newSearchHandler(req, res) {
    let { country, datefrom, dateto } = req.body;
    console.log(req.body);
    let url = `https://api.covid19api.com/country/${country}/status/confirmed?from=${datefrom}T00:00:00Z&to=${dateto}T00:00:00Z`;
    superagent.get(url).then((results) => {
        res.render('pages/getCountryResult', { data: results.body })
    })
}

function allCountriesHandler(req, res) {
    let url = `https://api.covid19api.com/summary`;
    superagent.get(url).then((results) => {
        let apiData = results.body.Countries.map(item => {
            return new Country(item);
        })
        res.render('pages/allCountries', { data: apiData })
    })
}


function addCountryHandler(req, res) {
    let { country, countryCode, totalConfirmed, totalDeaths, totalRecovered, date } = req.body;
    let SQL = `INSERT INTO covid19 (country,countryCode,totalConfirmed,totalDeaths,totalRecovered,date) VALUES ($1,$2,$3,$4,$5,$6);`;
    let VALUES = [country, countryCode, totalConfirmed, totalDeaths, totalRecovered, date];
    client.query(SQL, VALUES).then(() => {
        res.redirect('/myRecords')

    })
}

function myRecordsHandler(req, res) {
    let SQL = `SELECT * FROM covid19;`;
    client.query(SQL).then((results) => {
        res.render('pages/myRecords', { data: results.rows })

    })
}

function deleteCountry(req, res) {
    let id = req.params.id;
    let SQL = `DELETE FROM covid19 WHERE id=$1;`;
    let VALUES = [id];
    client.query(SQL, VALUES).then(() => {
        res.redirect('/myRecords')

    })
}

function updateCountry(req, res) {
    let { country, countryCode, totalConfirmed, totalDeaths, totalRecovered, date } = req.body;
    let id = req.params.id;
    let SQL = `UPDATE covid19 SET country=$1,countrycode=$2,totalconfirmed=$3,totaldeaths=$4,totalrecovered=$5,date=$6 WHERE id=$7;`;
    let VALUES = [country, countryCode, totalConfirmed, totalDeaths, totalRecovered, date, id];
    client.query(SQL, VALUES).then(() => {
        res.redirect(`/country/${id}`)

    })
}


function countryDetailsHandler(req, res) {
    let id = req.params.id;
    let SQL = `SELECT * FROM covid19 WHERE id=$1;`;
    let VALUES = [id]
    client.query(SQL, VALUES).then((results) => {
        res.render('pages/country', { data: results.rows[0] })

    })
}


//constructor
function Country(obj) {
    this.Country = obj.Country;
    this.CountryCode = obj.CountryCode;
    this.TotalConfirmed = obj.TotalConfirmed;
    this.TotalDeaths = obj.TotalDeaths;
    this.TotalRecovered = obj.TotalRecovered;
    this.Date = obj.Date
}




//Port listening
client.connect().then(() => {
    app.listen(PORT, () => {
        console.log(`Listening to PORT:${PORT}`);
    })
})


