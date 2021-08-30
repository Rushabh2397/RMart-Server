const { Product } = require('../../../models')
const async = require('async')
const config = require('../../../config')


module.exports = {

    getAllProducts: (req, res) => {

        async.waterfall([
            (nextCall) => {
                let filter = req.body.filter;
                let applyFilter = {};
                let sort = {};
                let aggregateQuery = [];

                if (req.body.search) {
                    let regex = new RegExp(req.body.search, 'i')
          
                    let search = {
                      $or: [
                        {
                          'name': regex
                        },
                        {
                          'brand': regex
                        }
                      ]
                    }
          
                    aggregateQuery.push({
                      '$match': search
                    })
                  }

                if (filter) {
                    if (filter.brands.length > 0) {
                        applyFilter.brand = { $in: filter.brands }
                    }

                    if (filter.gender.length > 0) {
                        applyFilter.type = { $in: filter.gender }
                    }

                    if (filter.range.length > 0) {
                        applyFilter.rate = { $gte: filter.range[0], $lte: filter.range[1] }
                    }
                    aggregateQuery.push({
                        $match: {
                            $and: [applyFilter]
                        }
                    })
                }

                if (filter && filter.price) {
                    sort['price'] = parseInt(filter.price);
                } else {
                    sort = { created_at: 1 }
                }
                aggregateQuery.push({
                    $sort: sort
                })
                aggregateQuery.push({
                    $group: {
                        _id: null,
                        total_products: { $sum: 1 },
                        products: {
                            $push: {
                                "_id": "$_id",
                                "name": "$name",
                                "type": "$type",
                                "price": "$price",
                                "description": "$description",
                                "brand": "$brand",
                                "image": { "$concat": [config.imgUrl + '/products/', "$image"] },
                                "created_at": "$created_at",
                                "updated_at": "$updated_at"
                            }
                        }
                    }
                })
                nextCall(null, aggregateQuery)
            },
            (aggregateQuery, nextCall) => {
                Product.aggregate(aggregateQuery).exec((err, list) => {
                    if (err) {
                        return nextCall(err)
                    }
                    list = list && list.length > 0 ? list[0] : { total_products: 0, products: [] }
                    nextCall(null, list)
                })
            }
        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed get products.'
                })
            }
            res.json({
                status: "success",
                message: 'Product list.',
                data: response
            })
        })
    },

    getProduct: (req, res) => {
        async.waterfall([
            (nextCall) => {
                Product.findById(req.body.product_id, (err, product) => {
                    if (err) {
                        return nextCall(err)
                    }
                    product.image = config.imgUrl + '/products/' + product.image;
                    nextCall(null, product)
                })
            }

        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed get product detail.'
                })
            }
            res.json({
                status: "success",
                message: 'Product detail.',
                data: response
            })
        })
    }
}