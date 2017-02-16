var orderStatus = require('../../common/js/orderStatus.js')
var utils = require('../../libs/utils.js')
Page({
    data: {
        present_order: {},
        order_status_description: {},
        shop_name: ''
    },
    onLoad: function(option) {
        var self = this
        var order_id = option.order_id
        wx.request({
            url: 'https://app.cumpusbox.com/v1/orders/get_my_orders',
            data: {
                page: 1, //页数   required
                size: 10, //每页大小  required
                order_id: option.order_id, //订单号   （获取某一订单的时候必传）
                user_id: wx.getStorageSync('user').id //用户ID  required
            },
            method: 'POST',
            success: function(res) {
              var present_order = res.data.data[0]
              for (var i = 0; i < present_order.items.length; i++) {
                  present_order.items[i].book_price = (present_order.items[i].book_price / 100).toFixed(2)
              }
              present_order.total_price = (present_order.total_price / 100).toFixed(2)
              present_order.freight = (present_order.freight / 100).toFixed(2)
              present_order.order_at = utils.unixTimestamp2DateStr(present_order.order_at)
              var order_status_description = orderStatus.orderStatusDescription(present_order.order_status)
              self.setData({
                  present_order: present_order,
                  order_status_description: order_status_description
              })
            }
        })
        wx.getStorage({
            key: 'shop',
            success: function(res) {
                var shop_name = res.data.shop_name.trim()
                self.setData({
                    shop_name: shop_name
                })
            }
        })
    },
    onUnload: function(e) {
        wx.switchTab({
            url: '/pages/me/me'
        })
    },
    shopDetail(e) {
        wx.navigateTo({
            url: '/pages/shopDetail/shopDetail'
        })
    }
})
