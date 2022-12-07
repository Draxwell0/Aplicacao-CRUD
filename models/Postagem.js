const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Postagem = new Schema({

    titulo:{
        type: String,
        required: true
    },
    conteudo:{
        type: String,
        required: true
    },
    categoria:{
        type: Schema.Types.ObjectId,
        ref: 'categorias',
        required: true
    },
    data:{
        type: Date,
        default: Date.now() 
    }

});

const post = mongoose.model('postagens', Postagem);

module.exports = post;