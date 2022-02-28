
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require("cors");
const { json } = require("body-parser");
const fileUpload = require('express-fileupload');
// const multer = require("multer")


const objectId = require('mongodb').ObjectId;
require('dotenv').config();
const app = express();
// MiddleWare
app.use(cors());
app.use(express.json());
app.use(fileUpload());
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads/")
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + "-" + file.originalname)
//     },
// })

// const uploadStorage = multer({ storage: storage })
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.11xcw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri) // for checking user/pass is alright

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db("jobCollections");
        const jobs = database.collection("jobs");
        const applyList = database.collection("applyList");
        const userCollection = database.collection("users");


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

        app.get('/applyList', async (req, res) => {
            const cursor = applyList.find({});
            const apply = await cursor.toArray();
            res.send(apply)
        })

        // GET SINGLE JOBS

        app.get('/applyList/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: objectId(id) };
            console.log(query)
            const apply = await jobs.findOne(query);
            res.json(apply);
        })
        app.post('/applyList', async (req, res) => {
            const firstName = req.body.firstName;
            const lastName = req.body.lastName;
            const dob = req.body.dob;
            const age = req.body.age;
            const email = req.body.email;
            const contactNo = req.body.contactNo;
            const linkedIn = req.body.linkedIn;
            const portfolio = req.body.portfolio;
            const resume = req.files.resumepdfFile;
            const resumePdf = resume.data;
            const encodedresumePdf = resumePdf.toString('base64');
            const resumePdfBuffer = Buffer.from(encodedresumePdf, 'base64');
            const coverLetter = req.files.coverLetterpdfFile;
            const coverLetterPdf = coverLetter.data;
            const encodedcoverletterPdf = coverLetterPdf.toString('base64');
            const coverLetterPdfBuffer = Buffer.from(encodedcoverletterPdf, 'base64');



            const apply = {
                firstName,
                lastName,
                dob,
                age,
                email,
                contactNo,
                linkedIn,
                portfolio,
                resume: resumePdfBuffer,
                coverLetter: coverLetterPdfBuffer
            }
            const result = await applyList.insertOne(apply);
            res.send(result);
            console.log(apply)
        })
        //user registration post api

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });
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