
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require("cors");

const objectId = require('mongodb').ObjectId;
require('dotenv').config();
const app = express();
// MiddleWare
app.use(cors());
app.use(express.json())
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.11xcw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri) // for checking user/pass is alright

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db("jobCollections");
        const jobs = database.collection("jobs");


        //GET API  JOBS

        app.get('/jobs', async (req, res) => {
            const cursor = jobs.find({});
            const job = await cursor.toArray();
            res.send(job)
        })

        // GET SINGLE JOBS

        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: objectId(id) };
            console.log(query)
            const job = await jobs.findOne(query);
            res.json(job);
        })

    } finally {
        //await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})