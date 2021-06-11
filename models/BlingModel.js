const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlingSchema = new Schema({
    blValorTotal: Number,
    blData: Date
});

const Bling = mongoose.model('pedidosbling', BlingSchema);
module.exports = Bling;