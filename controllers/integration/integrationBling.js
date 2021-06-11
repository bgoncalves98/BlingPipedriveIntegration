const app = require('express');
const router = app.Router();
const validAuth = require('../../components/validAuth');
const querystring = require('querystring');
const { create } = require('xmlbuilder2');
const fetch = require('node-fetch');
const pipeOp = require('./integrationPipedrive');
const moment = require('moment');

router.post('/WonOpportunities', validAuth, async(req, res) => {

    try {

        const opportunities = await pipeOp();

        if (opportunities.data.length === 0) {
            res.status(400).send({
                message: 'Não foi possível localizar itens ganhos!',
            });
            return;
        }

        opportunities.data.map(async (item) => {

            const dtLancamento = moment(item.won_time).format('DD/MM/yyyy')

            //Criando XML para a requisição
            const root = create()
                .ele('pedido')
                    .ele('cliente')
                        .ele('nome').txt(item.person_id.name).up()
                    .up()
                    .ele('data').txt(dtLancamento).up()
                    .ele('itens')
                        .ele('item')
                            .ele('codigo').txt(item.id).up()
                            .ele('descricao').txt(item.title).up()
                            .ele('vlr_unit').txt(item.value).up()
                            .ele('qtde').txt(1).up()
                        .up()
                    .up()
                .up()

            const viewXml = root.end();
            const params = {
                apikey : process.env.TKN_BLING,
                xml: viewXml
            }

            const req_params = querystring.stringify(params);

            //Inserindo como pedido no Bling
            const result = await fetch(process.env.API_BLING + 'pedido/json/?' + req_params, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': params.xml.length
                },
            });

        });

        res.status(200).send({
            message: 'Itens incluídos com sucesso!'
        })

    } catch (e) {
        res.status(400).send({
            message: 'Erro ao incluir os pedidos no Bling.'
        })
    }

});

module.exports = router;