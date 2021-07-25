const v1 = require('./v1')
const admin = require('./admin')

module.exports = (app,apiBase)=>{
    v1(app,`${apiBase}/v1`)
    admin(app,`${apiBase}/admin`)
}