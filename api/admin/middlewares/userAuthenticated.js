const jwt = require('jsonwebtoken') 

module.exports = (req,res,next)=>{

    let token = req.headers ? req.headers['authorization'] : ''
    
    jwt.verify(token,'secret',(err,tok)=>{
        if(err){
            return res.status(401).json({
                message : err && err.message
            })
        } else if(tok && tok._id){
            req.user = tok;
            next()
        } else {
            return res.status(401).json({
                message : 'Something went wrong.'
            })
        }
    })

}