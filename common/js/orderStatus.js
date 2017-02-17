var order_status = [{
        code: 1,
        mark: '待付款',
        description: '等待买家付款'
    },
    {
        code: 2,
        mark: '待发货',
        description: '等待卖家发货'
    },
    {
        code: 3,
        mark: '待收货',
        description: '卖家已发货'
    },
    {
        code: 4,
        mark: '已完成',
        description: '交易成功'
    },
    {
        code: 5,
        mark: '已关闭',
        description: '订单已关闭'
    }
]

function orderStatusDescription(index) {
    return order_status[--index]
}

module.exports.orderStatusDescription = orderStatusDescription
