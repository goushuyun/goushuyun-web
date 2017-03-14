var app = getApp()
Page({
    data: {
        order: {},
        order_id: '',
        avatar_url: ''
    },
    onLoad: function(options) {
        var order_id = options.order_id
        var avatar_url = options.avatar_url
        var user_id = options.user_id
        var self = this
        self.setData({
            order_id: order_id,
            avatar_url: avatar_url
        })
        wx.request({
            url: app.url + '/v1/orders/get_my_orders',
            data: {
                page: 1, //页数   required
                size: 10, //每页大小  required
                order_id: order_id, //订单号   （获取某一订单的时候必传）
                user_id: user_id //用户ID  required
            },
            method: 'POST',
            success: function(res) {
                var order = res.data.data[0]
                self.setData({
                    order: order
                })
            }
        })
    },
    toIndexPage() {
        wx.switchTab({
            url: '/pages/index/index'
        })
    },
    toShopCart() {
        wx.showToast({
            title: '正在加入购物车......',
            icon: 'loading',
            duration: 10000
        })
        setTimeout(() => {
            wx.hideToast()
            wx.switchTab({
                url: '/pages/shopCart/shopCart'
            })
        }, 1500);
    }
})
