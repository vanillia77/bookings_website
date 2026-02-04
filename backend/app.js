const express = require("express");
const cors = require("cors");

require("./init-db");

const app = express();
app.use(cors());
app.use(express.json());


app.use("/auth", require("./routes/auth.routes"));
app.use("/bookings", require("./routes/bookings.routes"));

app.listen(3000, () => console.log("Server running on port 3000"));
