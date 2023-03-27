import {MongoClient, ServerApiVersion} from 'mongodb';

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@boxscores.xsfpcyt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1});

let conn;
try {
    conn = await client.connect();
} catch (e) {
    console.error(e);
}

let db = conn.db("box_scores");

export default db;