
const bcrypt = require('bcryptjs')

function basicAuth(req, res, next) {
    const authToken = req.get('Authorization')
    let basicToken

    if (!authToken.toLowerCase().startsWith('basic ')){
        return res.status(401).json({error: 'missing basic authorization'})
    } else {
        basicToken = authToken.slice('basic '.length, authToken.length)
    }

    const [tokenUserName, tokenPassword] = Buffer.from(basicToken, 'base64').toString().split(':')

    if (!tokenUserName || !tokenPassword){
        return res.status(401).json({error: 'missing basic authorization'})
    }

    req.app.get('db')('thingful_users')
        .where({ user_name: tokenUserName })
        .first()
        .then(user =>{
            if(!user){
                return res.status(401).json({error: 'Unauthorized'})
            }

            return bcrypt.compare(tokenPassword, user.password)
                .then(passwordMatch=>{
                    if (!passwordMatch){
                        return res.status(401).json({error: 'Unauthorized'})
                    }
                    req.user = user
                    next()
                })            
        })
    .catch(next)
}

module.exports = basicAuth
