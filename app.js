const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require("./routes/auth");
const documentRoutes = require("./routes/document");
const roleRoutes = require("./routes/roles")
const wss = require("./webSocket");
const common = require("./config/common")
const MONGODB_URI = common.config()["MONGODB_URI"]
const PORT = common.config()["SERVER_PORT"]

const app = express();
app.use(bodyParser.json());

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(_ => {
  console.log(`connected to mongo uri : ${MONGODB_URI}`)
}).catch(e => {
  console.log(`Catched error in connecting to mongo : ${e.message}`)
  throw e
});

app.use('/auth', authRoutes);
app.use('/document/v1', documentRoutes);
app.use('/role/v1', roleRoutes)

const server = app.listen(PORT || 3000, () => {
  console.log(`Server is running on port ${PORT || 3000}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});