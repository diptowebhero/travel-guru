const express = require("express");
const app = express();
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;
const cors = require("cors");

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mxsis.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log(uri);
async function run() {
  try {
    await client.connect();
    const database = client.db("travelPackages");
    const service_collection = database.collection("service");
    const booking_collection = database.collection("booking");
    const user_collection = database.collection("users");

    //GET ALL PACKAGE
    app.get("/packages", async (req, res) => {
      const cursor = await service_collection.find({}).toArray();
      res.send(cursor);
    });

    //get single packages
    app.get("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await service_collection.findOne(query);
      res.json(result);
    });

    //booking
    app.post("/booking", async (req, res) => {
      const booking = req.body;
      const result = await booking_collection.insertOne(booking);
      res.json(result);
    });

    //
    app.get("/booking", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await booking_collection.find(query).toArray();
      res.json(result);
    });

    app.get("/orders", async (req, res) => {
      const cursor = await booking_collection.find({}).toArray();
      res.send(cursor);
    });

    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await booking_collection.deleteOne(query);
      res.json(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await user_collection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    app.post("/users", async (req, res) => {
      const users = req.body;
      const result = await user_collection.insertOne(users);
      res.json(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await user_collection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await user_collection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.put("/confirm/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const packages = {
        $set: {
          status:"Confirm"
        },
      };
      const result = await booking_collection.updateOne(query, packages);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Travel guru server is running");
});

app.listen(port, () => {
  console.log("listening from", port);
});
