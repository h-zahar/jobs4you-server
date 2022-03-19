const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const { json } = require("body-parser");
const fileUpload = require("express-fileupload");
const socketio = require("socket.io");
const http = require("http");
const {
  addUser,
  removeUser,
  getUsers,
  getUser,
  getRemainedUsers,
  getUsersInRoom,
  getRemainedUsersInRoom,
} = require("./users");
const pdf = require("html-pdf");
const pdfTemplate = require("./PdfCreate");
// const multer = require("multer")

const objectId = require("mongodb").ObjectId;
require("dotenv").config();
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

console.log(uri); // for checking user/pass is alright

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Creating Socket Server - Rifat
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
    // allowedHeaders: ["accept-header"],
    methods: ["GET", "POST"],
    // credentials: true
  },
});

// Establishing Connection - Rifat
io.on("connection", (socket) => {
  // console.log('New connection!');

  socket.on("join", ({ name, room }, callback) => {
    const { user, error } = addUser({ id: socket.id, name, room });
    // console.log(user);

    if (error) {
      return callback(error);
    }

    socket.emit("message", {
      user: "admin",
      text: `hey, welcome to Jobs4You!`,
    });
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    socket.emit("getUsers", { allUsers: getUsers() });

    socket.join(user.room);

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.id, user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", { user: user.name, text: message });
    socket.emit("getUsers", { users: getUsers() });
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.id, user.room),
    });

    callback();
  });

  socket.on("disconnect", () => {
    // console.log('User has disconnected');
    const user = getUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left.`,
      });
      socket.emit("getUsers", { users: getRemainedUsers(user.id) });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getRemainedUsersInRoom(user.id, user.room),
      });
      removeUser();
    }
  });
});

async function run() {
  try {
    await client.connect();
    const database = client.db("jobCollections");
    const jobs = database.collection("jobs");
    const applyList = database.collection("applyList");
    const userCollection = database.collection("users");
    const resumeCollection = database.collection("resumes");
    // ... Raju's DB && Collection
    const profileDB = client.db("AllProfiles");
    const govJobsCollection = database.collection("Gov-jobs");
    const candidatesCollection = profileDB.collection("CandidatesProfile");
    const employersCollection = profileDB.collection("EmployersProfile");
    //............

    const skills = database.collection("skills");

    const companies = client.db("companyCollection");
    const topCompanies = companies.collection("topCompanies");

    const faqbase = client.db("faqbase");
    const faq = faqbase.collection("customFaq");
    const reviewCollection = database.collection("reviews");
    //GET API  JOBS

    app.get("/jobs", async (req, res) => {
      const cursor = jobs.find({});
      const job = await cursor.toArray();
      res.send(job);
    });

    // GET SINGLE JOBS

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: objectId(id) };
      console.log(query);
      const job = await jobs.findOne(query);
      res.json(job);
    });

    app.get("/applyList", async (req, res) => {
      const cursor = applyList.find({});
      const apply = await cursor.toArray();
      res.send(apply);
    });

    // GET SINGLE JOBS

    app.get("/applyList/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: objectId(id) };
      console.log(query);
      const apply = await jobs.findOne(query);
      res.json(apply);
    });
    app.post("/applyList", async (req, res) => {
      const job = req.body.job;
      const company = req.body.company;
      const jobLocation = req.body.jobLocation;
      const employmentStatus = req.body.employmentStatus;
      const image = req.body.image;
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
      const encodedresumePdf = resumePdf.toString("base64");
      const resumePdfBuffer = Buffer.from(encodedresumePdf, "base64");
      const coverLetter = req.files.coverLetterpdfFile;
      const coverLetterPdf = coverLetter.data;
      const encodedcoverletterPdf = coverLetterPdf.toString("base64");
      const coverLetterPdfBuffer = Buffer.from(encodedcoverletterPdf, "base64");

      const apply = {
        job,
        company,
        jobLocation,
        employmentStatus,
        image,
        firstName,
        lastName,
        dob,
        age,
        email,
        contactNo,
        linkedIn,
        portfolio,
        resume: resumePdfBuffer,
        coverLetter: coverLetterPdfBuffer,
      };
      const result = await applyList.insertOne(apply);
      res.send(result);
      console.log(apply);
    });

    // Get RESUME
    app.get("/resume", async (req, res) => {
      const cursor = resumeCollection.find({});
      const resume = await cursor.toArray();
      res.send(resume);
    });

    // GET SINGLE RESUME

    app.get("/resume/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: objectId(id) };
      console.log(query);
      const resume = await resumeCollections.findOne(query);
      res.json(resume);
    });
    app.post("/resume", async (req, res) => {
      const email = req.body.email;

      const resume = req.files.resumepdfFile;
      const resumePdf = resume.data;
      const encodedresumePdf = resumePdf.toString("base64");
      const resumePdfBuffer = Buffer.from(encodedresumePdf, "base64");

      const resumeUpload = {
        email,
        resume: resumePdfBuffer,
      };
      const result = await resumeCollection.insertOne(resumeUpload);
      res.send(result);
      console.log(resumeUpload);

      // Update Resume API

      app.put("/updateInfo/:id", async (req, res) => {
        const id = req.params.id;
        const updatedInfo = req.body;
        const filter = { _id: objectId(id) };
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            resume: updatedInfo.resume,
          },
        };
        const result = await resumeCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        console.log("updating", updatedInfo);
        res.json(result);
      });
    });

    // End Sadia Code //

    //shaon code
    //User Registration Post Api

    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find({});
      const user = await cursor.toArray();
      res.send(user);
    });
    //admin role get api
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = "seeker";
      if (user?.role === "admin") {
        isAdmin = "admin";
      } else if (user?.role === "seeker") {
        isAdmin = "seeker";
      } else if (user?.role === "company") {
        isAdmin = "company";
      }
      console.log(isAdmin);
      res.json({ admin: isAdmin });
    });

    //admin role get api
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = "user";
      if (user?.role === "admin") {
        isAdmin = "admin";
      } else if (user?.role === "seeker") {
        isAdmin = "seeker";
      } else if (user?.role === "company") {
        isAdmin = "company";
      }

      res.json({ admin: isAdmin });
    });

    //get all review
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find({});

      const reviews = await cursor.toArray();

      res.send(reviews);
    });

    //Review POST API
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      // console.log('post hitted', service);
      // order.status = 'pending';
      // console.log(order);
      const result = await reviewCollection.insertOne(review);

      console.log(result);
      res.json(result);
    });
    //google sign in user update/put function
    app.put("/users", async (req, res) => {
      const user = req.body;
      // user.role = 'seeker';
      console.log("this is google user", user);
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });
    //make admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    // Nuzhat's Server

    // Post a Job
    app.post("/jobs", async (req, res) => {
      const job = req.body;
      job.status = "pending";
      const result = await jobs.insertOne(job);
      console.log(result);
      res.json(result);
    });

    // Update a Job Status
    app.put("/updateJob/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: objectId(id) };
      const updatedJob = req.body;
      const options = { upsert: true };
      const updatedDoc = { $set: { status: updatedJob.status } };
      const result = await jobs.updateOne(filter, updatedDoc, options);
      res.json(result);
    });

    // Update field of job details

    app.put("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: objectId(id) };
      const updatedJob = req.body;
      console.log(updatedJob);
      const options = { upsert: true };
      const updatedDoc = { $set: updatedJob };
      const result = await jobs.updateOne(filter, updatedDoc, options);
      res.json(result);
    });

    // Server - Rifat

    // Skill Add
    app.get("/posted-skills/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: objectId(id) };
      const result = await jobs.findOne(query);
      // console.log(result)

      const { skills } = result;

      if (skills) {
        res.json(skills);
      }
    });

    app.get("/skills/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await skills.findOne(query);

      if (result?.skills) {
        res.json(result.skills);
      }
    });

    app.put("/skills", async (req, res) => {
      const upsertDoc = req.body;
      const filter = { email: upsertDoc?.email };
      const options = { upsert: true };

      const upsertedDoc = {
        $set: upsertDoc,
      };

      const result = await skills.updateOne(filter, upsertedDoc, options);

      if (result?.acknowledged) {
        res.json(result);
      }
    });

    // Company Collection
    app.get("/top", async (req, res) => {
      const query = {};
      const cursor = topCompanies.find(query);

      const result = await cursor.toArray();

      if (result) {
        res.json(result);
      } else {
        res.send([]);
      }
    });

    // Faq Post
    app.get("/customfaq", async (req, res) => {
      const query = {};
      const cursor = faq.find(query);

      const result = await cursor.toArray();

      if (result) {
        res.json(result);
      } else {
        res.send([]);
      }
    });

    app.post("/customfaq", async (req, res) => {
      const insertDoc = req.body;

      const result = await faq.insertOne(insertDoc);
      res.json(result);
    });

    app.put("/customfaq", async (req, res) => {
      const updated = req.body;

      const filter = { _id: objectId(updated._id) };

      const finalizeDoc = { comment: updated.comment, reply: updated.reply };

      const updateDoc = {
        $set: finalizeDoc,
      };

      const result = await faq.updateOne(filter, updateDoc);

      if (result) {
        res.json(updated);
      }
    });

    app.get("/faqGetDislikes", async (req, res) => {
      const { id, email } = req.query;
      const query = { _id: objectId(id) };

      const result = await faq.findOne(query);

      if (result) {
        let isDisliked = false;
        const isFound = await result?.disliked?.findIndex(
          (single) => single === email
        );

        if (isFound === -1) {
          isDisliked = false;
        } else if (isFound !== -1) {
          isDisliked = true;
        }

        res.json({ isDisliked, dislikes: result?.disliked?.length });
      }
    });

    app.put("/faqDislike/:email", async (req, res) => {
      const email = req.params.email;
      const updated = req.body;
      console.log(email, updated);

      const filter = { _id: objectId(updated?._id) };

      if (!updated?.liked) {
        updated.liked = [];
      }

      if (!updated?.disliked) {
        updated.disliked = [];
      }

      const isFound = await updated?.disliked.findIndex(
        (single) => single === email
      );

      const isOppositeFound = await updated?.liked.findIndex(
        (single) => single === email
      );

      if (email && isFound === -1) {
        if (isOppositeFound !== -1) {
          await updated?.liked.splice(isOppositeFound, isOppositeFound + 1)[0];
        }

        await updated?.disliked.push(email);
        const finalizeDoc = {
          comment: updated.comment,
          reply: updated.reply,
          liked: updated.liked,
          disliked: updated.disliked,
        };
        const updateDoc = {
          $set: finalizeDoc,
        };
        const result = await faq.updateOne(filter, updateDoc);

        res.json(result);
      } else if (email && isFound !== -1 && updated?.disliked.length) {
        await updated?.disliked.splice(isFound, isFound + 1)[0];

        const finalizeDoc = {
          comment: updated.comment,
          reply: updated.reply,
          liked: updated.liked,
          disliked: updated.disliked,
        };

        const updateDoc = {
          $set: finalizeDoc,
        };
        const result = await faq.updateOne(filter, updateDoc);

        res.json(result);
      }
    });

    app.get("/faqGetLikes", async (req, res) => {
      const { id, email } = req.query;
      const query = { _id: objectId(id) };

      const result = await faq.findOne(query);

      if (result) {
        let isLiked = false;
        const isFound = await result?.liked?.findIndex(
          (single) => single === email
        );

        if (isFound === -1) {
          isLiked = false;
        } else if (isFound !== -1) {
          isLiked = true;
        }

        res.json({ isLiked, likes: result?.liked?.length });
      }
    });

    app.put("/faqLike/:email", async (req, res) => {
      const email = req.params.email;
      const updated = req.body;
      console.log(email, updated);

      const filter = { _id: objectId(updated?._id) };

      if (!updated?.liked) {
        updated.liked = [];
      }

      if (!updated?.disliked) {
        updated.disliked = [];
      }

      const isFound = await updated?.liked.findIndex(
        (single) => single === email
      );

      const isOppositeFound = await updated?.disliked.findIndex(
        (single) => single === email
      );

      if (email && isFound === -1) {
        if (isOppositeFound !== -1) {
          await updated?.disliked.splice(
            isOppositeFound,
            isOppositeFound + 1
          )[0];
        }

        await updated?.liked.push(email);
        const finalizeDoc = {
          comment: updated.comment,
          reply: updated.reply,
          liked: updated.liked,
          disliked: updated.disliked,
        };
        const updateDoc = {
          $set: finalizeDoc,
        };
        const result = await faq.updateOne(filter, updateDoc);

        res.json(result);
      } else if (email && isFound !== -1 && updated?.liked.length) {
        await updated?.liked.splice(isFound, isFound + 1)[0];

        const finalizeDoc = {
          comment: updated.comment,
          reply: updated.reply,
          liked: updated.liked,
          disliked: updated.disliked,
        };
        const updateDoc = {
          $set: finalizeDoc,
        };
        const result = await faq.updateOne(filter, updateDoc);

        res.json(result);
      }
    });
    // ****** Raju **********//
    // Post gov jobs
    app.post("/addgovjob", async (req, res) => {
      const jobInfo = req.body;
      const insertedJob = await govJobsCollection.insertOne(jobInfo);
      res.json(insertedJob);
    });
    // get gov jobs
    app.get("/allgovjobs", async (req, res) => {
      const getAllJobs = await govJobsCollection.find({}).toArray();
      res.json(getAllJobs);
    });
    //   get single job
    app.get("/allgovjobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: objectId(id) };
      console.log(query);
      const job = await govJobsCollection.findOne(query);
      res.json(job);
    });
    // Edit gov jobs
    app.put("/govjobs/:id", async (req, res) => {
      const filter = { _id: objectId(req.params.id) };
      console.log(filter);
      const updateStatus = {
        $set: {
          organization: req.body.organization,
          position: req.body.position,
          deadline: req.body.deadline,
          vacancy: req.body.vacancy,
        },
      };
      const updateResult = await govJobsCollection.updateOne(
        filter,
        updateStatus
      );
      console.log(updateResult);
      res.json(updateResult);
    });
    // create pdf ( Raju )
    app.post("/createPdf", (req, res) => {
      console.log("server hit", req.body);
      pdf.create(pdfTemplate(req.body), {}).toFile("result.pdf", (err) => {
        if (err) {
          res.send(Promise.reject());
        }

        res.send(Promise.resolve());
        console.log(Promise.resolve());
      });
    });

    // get pdf

    app.get("/fetch-pdf", (req, res) => {
      res.sendFile(`${__dirname}/result.pdf`);
    });

    // Job-seekers && recruiter's profile
    app.post("/addProfile", async (req, res) => {
      const profileInfo = req.body;
      let insertedProfile;
      if (profileInfo.pEmail) {
        insertedProfile = await candidatesCollection.insertOne(profileInfo);
      } else {
        insertedProfile = await employersCollection.insertOne(profileInfo);
      }
      res.json(insertedProfile);
    });
    // All profile
    app.get("/allprofiles", async (req, res) => {
      const allCandidates = await candidatesCollection.find({}).toArray();
      res.json(allCandidates);
    });
    // All companies
    app.get("/companyprofiles", async (req, res) => {
      const allCompanies = await employersCollection.find({}).toArray();
      res.json(allCompanies);
    });
    //   get single profile
    app.get("/profile/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: objectId(id) };
      console.log(query);
      const candidate = await candidatesCollection.findOne(query);
      res.json(candidate);
    });
    app.get("/individualCandidate/:email", async (req, res) => {
      const queryEmail = req.params.email;
      console.log(queryEmail);
      const query = { pEmail: queryEmail };
      console.log(query);
      const candidate = await candidatesCollection.findOne(query);
      res.json(candidate);
    });
    //   get single companyProfile by email
    app.get("/individualCompany/:email", async (req, res) => {
      const queryEmail = req.params.email;
      console.log(queryEmail);
      const query = { email: queryEmail };
      console.log(query);
      const candidate = await employersCollection.findOne(query);
      res.json(candidate);
    });
    // Edit profile
    app.put("/singleProfile/:id", async (req, res) => {
      const filter = { _id: objectId(req.params.id) };
      console.log(filter);
      const updateStatus = {
        $set: {
          fname: req.body.fname,
          pEmail: req.body.pEmail,
          pContact: req.body.pContact,
          lname: req.body.lname,
          address: req.body.address,
          eContact: req.body.eContact,
        },
      };
      const updateResult = await candidatesCollection.updateOne(
        filter,
        updateStatus
      );
      console.log(updateResult);
      res.json(updateResult);
    });
    // Edit Company profile
    app.put("/singleCompany/:id", async (req, res) => {
      const filter = { _id: objectId(req.params.id) };
      const options = { upsert: true };
      console.log(filter);
      const updateStatus = {
        $set: {
          cname: req.body.cname,
          contact: req.body.contact,
          email: req.body.email,
          industry: req.body.industry,
          country: req.body.country,
          noe: req.body.noe,
          nob: req.body.nob,
          website: req.body.website,
        },
      };
      const updateResult = await employersCollection.updateOne(
        filter,
        updateStatus,
        options
      );
      console.log(updateResult);
      res.json(updateResult);
    });

    // ****** Raju **********//
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
