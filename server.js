const express = require("express");

const app = express();

const PORT = process.env.PORT || 8158;

const PAYSTACK_SECRET_KEY =
    process.env.PAYSTACK_SECRET_KEY;


/* =========================
   MIDDLEWARE
========================= */

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =========================
   SERVE WEBSITE
========================= */

app.use(
    express.static(__dirname)
);


/* =========================
   HEALTH CHECK
========================= */

app.get(
    "/api/health",
    (req, res) => {

        res.json({
            status: "ok",
            message:
                "Kelvin Event Hub backend is running"
        });

    }
);


/* =========================
   INITIALIZE PAYSTACK
========================= */

app.post(
    "/api/initialize-payment",
    async (req, res) => {

        try {

            /* -------------------------
               CHECK SECRET KEY
            ------------------------- */

            if (!PAYSTACK_SECRET_KEY) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Paystack secret key is not configured on the server."

                });

            }


            /* -------------------------
               GET CUSTOMER DATA
            ------------------------- */

            const {
                fullname,
                email,
                phone,
                tickets
            } = req.body;


            /* -------------------------
               VALIDATE DATA
            ------------------------- */

            if (
                !fullname ||
                !email ||
                !phone ||
                !tickets
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please provide your full name, email, phone number and number of tickets."

                });

            }


            const quantity =
                parseInt(tickets);


            if (
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > 5
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Ticket quantity must be between 1 and 5."

                });

            }


            /* -------------------------
               TICKET PRICE
            ------------------------- */

            const ticketPrice =
                2000;


            const total =
                quantity * ticketPrice;


            /*
             Paystack expects the amount
             in kobo.
            */

            const amount =
                total * 100;


            /* -------------------------
               INITIALIZE PAYSTACK
            ------------------------- */

            const response =
                await fetch(
                    "https://api.paystack.co/transaction/initialize",
                    {

                        method: "POST",

                        headers: {

                            Authorization:
                                `Bearer ${PAYSTACK_SECRET_KEY}`,

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                email:
                                    email,

                                amount:
                                    amount,

                                currency:
                                    "NGN",

                                callback_url:
                                    `${req.protocol}://${req.get("host")}/confirmation.html`,

                                metadata: {

                                    event:
                                        "Poetry Night 2026",

                                    attendee:
                                        fullname,

                                    phone:
                                        phone,

                                    ticketQuantity:
                                        quantity

                                }

                            })

                    }
                );


            /* -------------------------
               PAYSTACK RESPONSE
            ------------------------- */

            const data =
                await response.json();


            if (
                !response.ok ||
                !data.status
            ) {

                console.error(
                    "Paystack error:",
                    data
                );


                return res.status(500).json({

                    success: false,

                    message:
                        data.message ||
                        "Paystack could not initialize the payment."

                });

            }


            /* -------------------------
               SEND CHECKOUT URL
            ------------------------- */

            return res.json({

                success: true,

                reference:
                    data.data.reference,

                authorization_url:
                    data.data.authorization_url

            });


        }

        catch (error) {

            console.error(
                "Payment initialization error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to initialize payment."

            });

        }

    }
);


/* =========================
   START SERVER
========================= */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Kelvin Event Hub server running on port ${PORT}`
        );

    }
);