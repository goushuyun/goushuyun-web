var orderStatus = require('../../common/js/orderStatus.js')
var utils = require('../../libs/utils.js')
Page({
    data: {
        present_order: {},
        order_status_description: {},
        tel: '',
        out_time: 0,
        order_id: ''
    },
    onPullDownRefresh(e) {
        this.loadingOrder(this.data.order_id)
    },
    onLoad: function(option) {
        var order_id = option.order_id
        this.setData({
            order_id: order_id
        })
        this.loadingOrder(order_id)
    },
    loadingOrder: function(order_id) {
        var self = this
        var order_id = order_id
        wx.request({
            url: 'https://app.cumpusbox.com/v1/orders/get_my_orders',
            data: {
                page: 1, //页数   required
                size: 10, //每页大小  required
                order_id: order_id, //订单号   （获取某一订单的时候必传）
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
                /*未支付倒计时*/
                var my_date = new Date();
                var out_time = ((30 * 60 - (my_date.getTime() / 1000 - present_order.order_at)) / 60).toFixed(0)

                present_order.order_at = utils.unixTimestamp2DateStr(present_order.order_at)
                var order_status_description = orderStatus.orderStatusDescription(present_order.order_status)

                self.setData({
                    present_order: present_order,
                    order_status_description: order_status_description,
                    out_time: out_time
                })
            }
        })
        wx.getStorage({
            key: 'shop',
            success: function(res) {
                var tel = res.data.tel
                self.setData({
                    tel: tel
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
    },
    cancel_order(e) {
        var self = this
        var order_id = self.data.order_id
        console.log(order_id)
        wx.showModal({
            content: '您确定要取消该订单吗？',
            success: function(res) {
                var order_ids = [order_id]

                if (res.confirm) {
                    console.log(order_ids)

                    wx.request({
                        url: 'https://app.cumpusbox.com/v1/orders/cancel_order',
                        method: 'POST',
                        data: {
                            order_ids
                        },
                        success(res) {
                            if (res.data.code == '00000') {
                                self.loadingOrder(order_id)
                            }
                        }
                    })
                }
            }
        })
    },
    comfirmAccept(e) {
        var self = this
        var order_id = self.data.order_id
        console.log(order_id)
        wx.request({
            url: 'https://app.cumpusbox.com/v1/orders/accept_order',
            method: 'POST',
            data: {
                order_ids: [order_id]
            },
            success(res) {
                if (res.data.code == '00000') {
                    self.loadingOrder(order_id)
                }
            }
        })
    },
    toPay(e) {
        var self = this
        var order_id = self.data.order_id
            wx.showToast({
                title: '加载中',
                icon: 'loading',
                duration: 10000
            })
        console.log(order_id)
        wx.request({
            url: 'https://app.cumpusbox.com/v1/payment/delayed_pay',
            method: 'POST',
            data: {
                order_id
            },
            success(res) {
                console.log(res.data)
                if (res.data.message == 'ok') {
                    var payInfo = res.data.PaymentObj
                    var order_id = res.data.order_id
                    wx.hideToast()
                    wx.requestPayment({
                        timeStamp: payInfo.timeStamp,
                        nonceStr: payInfo.nonceStr,
                        package: payInfo.package,
                        signType: 'MD5',
                        paySign: payInfo.paySign,
                        complete: function(res) {
                            self.loadingOrder(order_id)
                        }
                    })
                } else {
                    // wx.navigateBack({
                    //     delta: 1
                    // })
                }
            }
        })
    },
    callSeller() {
        wx.makePhoneCall({
            phoneNumber: this.data.tel
        })
    },
})
