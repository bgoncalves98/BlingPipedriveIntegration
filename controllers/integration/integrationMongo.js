const ModelBling = require('../../models/BlingModel');
const app = require('express');
const router = app.Router();
const validAuth = require('../../components/validAuth');
const fetch = require('node-fetch');
const { create } = require('xmlbuilder2');
const querystring = require('querystring');

async function atualizaStatus(numPedido){

    try {

        //Criando XML para a requisição
        const root = create()
                    .ele('pedido')
                        .ele('idSituacao').txt('15').up()
                    .up()

        const viewXml = root.end();
        const params = {
            apikey : process.env.TKN_BLING,
            xml : viewXml
        }

        const req_params = querystring.stringify(params);
        const UrlReq = process.env.API_BLING + 'pedido/' + numPedido + '/json?' + req_params;

        //Atualizando status para Em Andamento
        const result = await fetch(UrlReq, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': params.xml.length
            }
        })
        const data = await result.json();
        return data;
    } catch (e) {
        return (e);
    }
}

async function inserePedidos(data, valorTotal) {

    const dtFormat = new Date(data).toISOString();
    const pedidos = await ModelBling.findOne({ blData: dtFormat })

    try {

        //Validando se já existe pedido na data informada
        if (!pedidos) {
             const inserePedido = ModelBling({
                 blValorTotal : Number(valorTotal),
                 blData: dtFormat
             })
             const data = await inserePedido.save();
             data.send();
             return data;
        } else {
             let atualizaPedido = {
                 $set: {
                     blValorTotal: Number(parseFloat(pedidos.blValorTotal) + parseFloat(valorTotal)),
                     blData: dtFormat
                 }
             }
             const data = await ModelBling.updateOne({ _id: pedidos._id}, atualizaPedido, (err) => {
                    if (err) return (err);         
                });
            return data;
        }    
    } catch (e) {
         return e;
    }
}

router.get('/pedidos', validAuth, async(req, res) => {

    const dataPedido = req.query.data;

    try {

        //Retornar pedidos de data específica caso seja informada
        if (!dataPedido) {
            const pedidos = await ModelBling.find();
            res.status(200).send(pedidos);
        } else {
            const dtFormat = new Date(dataPedido).toISOString();
            const pedidos = await ModelBling.find({ blData: dtFormat })
            res.status(200).send(pedidos);
        }

    } catch (e) {
        res.status(400).send({
            message: 'Erro ao tentar localizar os pedidos!'
        })
    }

})

router.post('/pedidos', validAuth, async(req, res) => {

    try {

        const params = {
            apikey: process.env.TKN_BLING
        }

        const req_params = querystring.stringify(params);
        const reqBling = await fetch(process.env.API_BLING + 'pedidos/json/?' + req_params);
        const data = await reqBling.json();

        //Chamando função de inclusão no MongoDB
        for (const d in data.retorno.pedidos){
            const item = data.retorno.pedidos[d].pedido;
            if (item.situacao === 'Em aberto') {
                await inserePedidos(item.data, item.totalvenda);
                await atualizaStatus(item.numero);
            }
        }

        res.status(200).send({
            message: 'Pedidos foram validados na base com sucesso!'
        })

    } catch (e) {
        res.status(400).send({
            message: 'Erro ao validar os pedidos'
        })
    }

})

module.exports = router;