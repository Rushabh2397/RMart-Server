const formidable = require('formidable');
const fse = require('fs-extra');
const sharp = require('sharp')
const path = require('path')
module.exports = {

    getFormFileds: (req, cb) => {
        let form = new formidable.IncomingForm()
        form.multiples = true;
        form.uploadDir = path.join(__dirname, '../../', 'uploads/temp')
        fse.ensureDir(form.uploadDir, (err) => {
            if (err) {
                return cb(err)
            }

            form.parse(req, (err, fields, files) => {
                if (err) {
                    return cb(err)
                }
                cb(null, fields, files)
            })

        })

    },

    upload: (options, cb) => {
        fse.ensureDir(options.dst, (err) => {
            if (err) {
                return cb(err)
            }
            sharp(options.src)
                .toFile(options.dst+'/'+options.fileName, (err, data) => {
                    if (err) {
                        return cb(err)
                    }
                    cb()
                })
        })
    },

    remove :(dst,cb)=>{
        fse.remove(dst,(err)=>{
            if(err){
                return cb(err)
            }
            cb(null)
        })
    },
}