const parseKML = require('parse-kml');
const geolib = require('geolib');
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// Port Number

const port = process.env.PORT || 3000;

app.use(bodyParser.json())

async function getOutletIdentifier(latLong) {
    try {
        const result = await parseKML.toJson('./FullStackTest_DeliveryAreas.kml');
        return new Promise((resolve, reject) => {
            result.features.forEach((element) => {
                if (element.geometry.type === "Polygon") {
                    const points = element.geometry.coordinates[0].map(p => ({ latitude: p[0], longitude: p[1] }));
                    if (geolib.isPointInPolygon(latLong, points)) {
                        resolve(element.properties.name);
                    } else {
                        resolve("not found");
                    }
                }
                else {
                    // checks if Point is within a radius of 10m
                    const point = { latitude: element.geometry.coordinates[0], longitude: element.geometry.coordinates[1] };
                    if (geolib.isPointWithinRadius(latLong, point, 10)) {
                        resolve(element.properties.name);
                    } else {
                        resolve("not found");
                    }
                }
            });
        })
    } catch (err) {
        console.error(err);
        throw err;
    }
}

app.get("/", async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const latLong = { latitude, longitude };
        const result = await getOutletIdentifier(latLong);
        res.json({ identifier: result });
    } catch (error) {
        res.status(400).send("Error");
    }

})

app.listen(port, () => console.log(`Server Running at Port ${port}`))