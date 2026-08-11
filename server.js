const express = require("express");

const app = express();

const PORT = process.env.PORT || 8158;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Kelvin Event Hub backend is running"
    });
});

app.listen(PORT, () => {
    console.log(`Kelvin Event Hub server running on port ${PORT}`);
});
