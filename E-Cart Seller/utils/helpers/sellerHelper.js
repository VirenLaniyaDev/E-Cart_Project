const mongodb = require('mongodb');
const getDB = require('../../services/connect_database').getDB;

exports.SellerHelper = class SellerHelper {

    // Get Seller chart data
    static seller_getChartData(sellerId) {
        const FIRST_MONTH = 1;
        const LAST_MONTH = 12;
        // const MONTHS_ARRAY = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const MONTHS_ARRAY = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        let TODAY = new Date();
        let YEAR_BEFORE = new Date(TODAY.setFullYear(TODAY.getFullYear() - 1));
        return getDB().collection('orders').aggregate([
            {
                $match: {
                    status: "Delivered",
                    "seller._id": sellerId,
                    $expr: { $and: [{ createdAt: ['$lte', TODAY] }, { createdAt: ['$gte', YEAR_BEFORE] }] }
                }
            },
            {
                $group: {
                    _id: { "year_month": { $substrCP: ["$createdAt", 0, 7] } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year_month": 1 }
            },
            {
                $project: {
                    _id: 0,
                    count: 1,
                    month_year: {
                        $concat: [
                            { $arrayElemAt: [MONTHS_ARRAY, { $subtract: [{ $toInt: { $substrCP: ["$_id.year_month", 5, 2] } }, 1] }] },
                            "-",
                            { $substrCP: ["$_id.year_month", 0, 4] }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    data: { $push: { k: "$month_year", v: "$count" } }
                }
            },
            {
                $addFields: {
                    start_year: { $substrCP: [YEAR_BEFORE, 0, 4] },
                    end_year: { $substrCP: [TODAY, 0, 4] },
                    months1: { $range: [{ $toInt: { $substrCP: [YEAR_BEFORE, 5, 2] } }, { $add: [LAST_MONTH, 1] }] },
                    months2: { $range: [FIRST_MONTH, { $add: [{ $toInt: { $substrCP: [TODAY, 5, 2] } }, 1] }] }
                }
            },
            {
                $addFields: {
                    template_data: {
                        $concatArrays: [
                            {
                                $map: {
                                    input: "$months1", as: "m1",
                                    in: {
                                        count: 0,
                                        month_year: {
                                            $concat: [{ $arrayElemAt: [MONTHS_ARRAY, { $subtract: ["$$m1", 1] }] }, "-", "$start_year"]
                                        }
                                    }
                                }
                            },
                            {
                                $map: {
                                    input: "$months2", as: "m2",
                                    in: {
                                        count: 0,
                                        month_year: {
                                            $concat: [{ $arrayElemAt: [MONTHS_ARRAY, { $subtract: ["$$m2", 1] }] }, "-", "$end_year"]
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            {
                $addFields: {
                    data: {
                        $map: {
                            input: "$template_data", as: "t",
                            in: {
                                k: "$$t.month_year",
                                v: {
                                    $reduce: {
                                        input: "$data", initialValue: 0,
                                        in: {
                                            $cond: [{ $eq: ["$$t.month_year", "$$this.k"] },
                                            { $add: ["$$this.v", "$$value"] },
                                            { $add: [0, "$$value"] }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    data: { $arrayToObject: "$data" },
                    _id: 0
                }
            }
        ]).toArray()
            .then(data => {
                if (data.length == 0) {
                    const MONTHS_ARRAY = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    let _data = {};
                    let date = new Date();
                    let currMonth = date.getMonth();
                    let prevMonth = currMonth;
                    for (let i = 0; i < 12; i++) {
                        if (prevMonth < currMonth) {
                            _data[`${MONTHS_ARRAY[prevMonth]}-${date.getFullYear()}`] = 0;
                        } else {
                            _data[`${MONTHS_ARRAY[prevMonth]}-${date.getFullYear() - 1}`] = 0;
                        }
                        prevMonth = (++prevMonth) % 12;
                    }
                    return [{ data: _data }]
                }
                return data;
            });
    }

    // Get Seller Overview information
    static async seller_getOverview(sellerId) {
        let _db = getDB();
        // Total orders count
        let totalCompletedOrders = await _db.collection('orders')
            .countDocuments({ "seller._id": sellerId, status: "Delivered" })
            .then(counts => { return counts; })
            .catch(err => { throw err });

        let date = new Date();
        // This month total order counts
        let thisMonthOrders = await _db.collection('orders').aggregate([
            {
                $match: {
                    "seller._id": sellerId,
                    $expr: {
                        $eq: [{ $month: "$createdAt" }, date.getMonth() + 1]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    thisMonthOrders: { $sum: 1 }
                }
            },
        ]).toArray()
            .then(data => {
                if (data.length == 0) {
                    return {
                        _id: null,
                        thisMonthOrders: 0
                    }
                }
                return data[0];
            })
            .catch(err => { throw err });

        // This day order
        let thisDayOrders = await _db.collection('orders').aggregate([
            {
                $match: {
                    "seller._id": sellerId,
                    $expr: {
                        $eq: [
                            { $dateToString: { format: '%Y-%m-%d', date: '$$NOW' } },
                            { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        ],
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    thisDayOrders: { $sum: 1 }
                }
            },
        ]).toArray()
            .then(data => {
                if (data.length == 0) {
                    return {
                        _id: null,
                        thisDayOrders: 0
                    }
                }
                return data[0];
            })
            .catch(err => { throw err });

        // Get available products
        let availableProducts = await _db.collection('products').countDocuments({ sellerId: sellerId });

        return {
            totalCompletedOrders: totalCompletedOrders,
            thisMonthOrders: thisMonthOrders.thisMonthOrders,
            thisDayOrders: thisDayOrders.thisDayOrders,
            availableProducts: availableProducts
        }
    }

}