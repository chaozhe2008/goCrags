const mongoose = require("mongoose");
const cities = require("./indianCities");
const crag = require("../models/crag");
const { places, descriptors } = require("./seedhelpers");
mongoose.connect("mongodb://localhost:27017/crag", {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useNewUrlParser: true,
});
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await crag.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 50);
        const crag = new crag({
            location: `${cities[random1000].City},${cities[random1000].State}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].Longitude,
                    cities[random1000].Latitude,
                ],
            },
            images: [
                {
                    url: "https://res.cloudinary.com/nivas-yelpcamp/image/upload/v1626532765/Yelpcamp/b912btmzmvkswogft0f6.jpg",
                    filename: "Yelpcamp/wudogyikexbewyhnowxm",
                },
                {
                    url: "https://res.cloudinary.com/nivas-yelpcamp/image/upload/v1625995832/Yelpcamp/wudogyikexbewyhnowxm.jpg",
                    filename: "Yelpcamp/zswuzdfyr3pm7zvpdilq",
                },
            ],
            description:
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt consequatur laborum unde facilis labore, deserunt obcaecati, aut harum fugiat, at alias suscipit. Quis aliquam numquam, voluptatem tempore obcaecati ad earum?",
            //price,
            author: "64320c4e526a5882ffe45dc7",
        });
        console.log(crag);
        await crag.save();
    }
};

// Update default crags to include author field
const defaultCrags = await crag.find({
    author: { $exists: false },
});
defaultCrags.forEach((crag) => {
    crag.author = "64320c4e526a5882ffe45dc7";
    crag.save();
});

seedDB().then(() => {
    mongoose.connection.close();
});
