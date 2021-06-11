//Efetuei apenas pra validação simples de acesso
function Auth(req, res, next) {
    
    const headerAuth = req.get('Authorization')
    
    if (headerAuth != process.env.AUTH) {
        return res.status(400).send({
            message: 'User does not have access privileges.'
        })
    }

    next();

}

module.exports = Auth;