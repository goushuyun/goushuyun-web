var app = getApp()
Page({
    data: {
        order: {},
        order_id: '',
        avatar_url: '',
        fake_data: {
            money: 0,
            green: 0,
            time: 0
        }
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
                var fake_data = {
                    money: parseInt(order.items.length * 5),
                    green: parseInt(order.items.length * 10),
                    time: (order.items.length * 0.2).toFixed(1)
                }
                self.setData({
                    order: order,
                    fake_data: fake_data
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
        var self = this
        wx.showToast({
            title: '正在加入购物车......',
            icon: 'loading',
            duration: 10000
        })
        wx.pro.request({
                url: app.url + '/v1/orders/to_order_again',
                method: 'POST',
                data: {
                    order_id: self.data.order_id,
                    user_id: wx.getStorageSync('user').id
                }
            })
            .then(res => {
                if (res.code == '00000') {
                    wx.hideToast()
                    wx.switchTab({
                        url: '/pages/shopCart/shopCart'
                    })
                }
            })
            .catch(err => {
                wx.showToast({
                    title: '服务器出bug了...',
                    icon: 'loading',
                    duration: 1500
                })
            })
    }
})
