import './config.js';
import express from 'express';
import db from './db.js';
import cors from 'cors';

const app = express();

// would restrict the list of origins in prod
app.use(cors());

const port = 3001;

// assuming server is long-running
// would store last-fetched time in DB if necessary
const min = 15000;
let lastMlbFetch;
let lastNbaFetch;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/mlb', async (req, res) => {
    const collection = await db.collection("mlb");
    const now = Date.now();

    try {
        const {results, fetched} = await fetchData(collection, process.env.MLB_URL, lastMlbFetch, now);
        if(fetched){
            lastMlbFetch = now;
        }
        results[0].lastUpdatedTime = new Date(lastMlbFetch).toLocaleTimeString();

        res.status(200).send(results);
    } catch (e) {
        res.status(500).send({error: true});
    }
});

app.get('/nba', async (req, res) => {
    const collection = await db.collection("nba");
    const now = Date.now();

    try {
        const {results, fetched} = await fetchData(collection, process.env.NBA_URL, lastNbaFetch, now);
        if(fetched){
            lastNbaFetch = now;
        }
        results[0].lastUpdatedTime = new Date(lastNbaFetch).toLocaleTimeString();

        res.status(200).send(results);
    } catch (e) {
        res.status(500).send({error: true});
    }


});

async function fetchData(collection, url, lastFetchedTime, now){
    let results;
    let fetched = false;
    if(!lastFetchedTime || now - lastFetchedTime >= min){
        fetched = true;
        const response = await fetch(url);
        results = await response.json();
        await collection.replaceOne({}, results, {upsert: true});
        results = [results];
    } else{
        results = await collection.find({}).toArray();
    }

    return {results, fetched};
}

app.listen(port, () => {
    console.log(`Box score API listening on port ${port}`);
});