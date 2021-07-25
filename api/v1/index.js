const route = require('./routes')
module.exports = (app,apiBase)=>{
    app.use(apiBase,route)
}