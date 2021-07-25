const v1 = require('./v1')

module.exports = (app,apiBase)=>{
    v1(app,`${apiBase}/v1`)
}