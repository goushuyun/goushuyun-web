var orderStatus = require('../../common/js/orderStatus.js')
var utils = require('../../libs/utils.js')
var app = getApp()
Page({
    data: {
        present_order: {},
        order_status_description: {},
        tel: '',
        out_time: 0,
        order_id: '',
        after_sale: {}
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
            url: app.url + '/v1/orders/get_my_orders',
            data: {
                page: 1, //页数   required
                size: 10, //每页大小  required
                order_id: order_id, //订单号   （获取某一订单的时候必传）
                user_id: wx.getStorageSync('user').id //用户ID  required
            },
            method: 'POST',
            success: function(res) {
                var present_order = res.data.data[0]
                /*未支付倒计时*/
                var my_date = new Date();
                var out_time = ((30 * 60 - (my_date.getTime() / 1000 - present_order.order_at)) / 60).toFixed(0)

                for (var i = 0; i < present_order.items.length; i++) {
                    present_order.items[i].book_price = (present_order.items[i].book_price / 100).toFixed(2)
                }
                present_order.total_price = (present_order.total_price / 100).toFixed(2)
                present_order.freight = (present_order.freight / 100).toFixed(2)
                present_order.order_at = utils.unixTimestamp2DateStr(present_order.order_at) //send_at
                present_order.pay_at = utils.unixTimestamp2DateStr(present_order.pay_at) //支付时间
                present_order.send_at = utils.unixTimestamp2DateStr(present_order.send_at) //发货时间
                present_order.accept_at = utils.unixTimestamp2DateStr(present_order.accept_at) //收货时间
                present_order.close_at = utils.unixTimestamp2DateStr(present_order.close_at) //关闭时间
                var order_status_description = orderStatus.orderStatusDescription(present_order.order_status)

                self.setData({
                    present_order: present_order,
                    order_status_description: order_status_description,
                    out_time: out_time
                })
                if (present_order.after_sale_status > 0) {
                    wx.request({
                        url: app.url + '/v1/orders/GetAfterSaleInfo',
                        method: 'POST',
                        data: {
                            id: present_order.after_sale_id
                        },
                        success(res) {
                            if (res.data.code == '00000') {
                                var after_sale = res.data.data
                                after_sale.require_refund_fee = (after_sale.require_refund_fee / 100).toFixed(2)
                                after_sale.actual_refund_fee = (after_sale.actual_refund_fee / 100).toFixed(2)
                                after_sale.apply_at = utils.unixTimestamp2DateStr(after_sale.apply_at)
                                after_sale.end_at = utils.unixTimestamp2DateStr(after_sale.end_at)
                                self.setData({
                                    after_sale: after_sale
                                })
                            }
                        }
                    })
                }
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
    apply_refund(e) {
        wx.navigateTo({
            url: '/pages/refund/refund?order_id=' + this.data.order_id
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
                        url: app.url + '/v1/orders/cancel_order',
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
            url: app.url + '/v1/orders/accept_order',
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
            url: app.url + '/v1/payment/delayed_pay',
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
    onShareAppMessage(e) {
        return {
            title: '我在 [购书云] 完成了一次 [新书|二手书] 购买，快来围观吧！',
            path: '/pages/share/share?order_id=' + this.data.order_id + '&user_id=' + wx.getStorageSync('user').id + '&avatar_url=' + wx.getStorageSync('user').avatarUrl
        }
    }
})
