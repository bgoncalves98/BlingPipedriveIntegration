const querystring = require('querystring');
const fetch = require('node-fetch');

async function pipeOp() {

    try {

        const params = {
            api_token: process.env.TKN_PIPEDRIVE,
            status: 'won'
        }

        const req_params = querystring.stringify(params);

        //Retornando pedidos do pipedrive
        const result = await fetch(process.env.API_PIPEDRIVE + '/v1/deals?' + req_params);
        const data = await result.json();
        return data;

    } catch (e) {
        return e;
    }

}

module.exports = pipeOp;