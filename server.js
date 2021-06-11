const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

app.listen(process.env.PORT);
app.use(cors());
app.use(express.json());

app.use('/api/integration', require('./controllers/integration/integrationBling'));
app.use('/api/integration/mongo', require('./controllers/integration/integrationMongo'));

mongoose.connect(process.env.URL_MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

mongoose.connection.on('connected', () => console.log('Conectado ao MongoDB'));