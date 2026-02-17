const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

app.get("/api/test", (req, res) => {
    res.json({ message: "Backend + DB working" });
});
const userSchema = new mongoose.Schema({
    name: String,
    email: String
});

const User = mongoose.model("User", userSchema);

app.post("/add-user", async (req, res) => {
    const user = new User({
        name: "Test User",
        email: "test@gmail.com"
    });
    await user.save();
    res.json({ message: "User saved" });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
