const express = require("express");

const app = express();
const PORT = process.env.PORT || 8158;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Kelvin Event Hub backend is running"
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Kelvin Event Hub server running on port ${PORT}`);
});
