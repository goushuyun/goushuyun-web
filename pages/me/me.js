var utils = require('../../libs/utils')
var app = getApp()
Page({
    data: {
        tabs: ['全部', '待付款', '待发货', '待收货', '已完成'],
        currentPage: 0,
        seller_tel: '',

        //订单信息
        user_id: '',
        orders: [],
        wait_pay_orders: [],
        wait_send_orders: [],
        wait_accept_orders: [],
        accepted_orders: [],
        page: 1,
        size: 100,
        total: 0,
        order_status: 0,

        //shop info
        shop_logo: ''
    },
    toPay(e) {
        var self = this
        wx.showToast({
            title: '加载中',
            icon: 'loading',
            duration: 10000
        })

        var order_id = e.currentTarget.dataset.id
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
                    console.log('----------------------');
                    console.log(payInfo);
                    wx.hideToast()
                    wx.requestPayment({
                        timeStamp: payInfo.timeStamp,
                        nonceStr: payInfo.nonceStr,
                        package: payInfo.package,
                        signType: 'MD5',
                        paySign: payInfo.paySign,
                        fail(res) {
                            console.log('----------------------');
                            console.log(res);
                        },
                        complete: function(res) {
                            wx.navigateTo({
                                url: '/pages/orderInfo/orderInfo?order_id=' + order_id
                            })
                        }
                    })
                } else if (res.data.message == 'timeout') {
                    wx.showModal({
                        content: '亲~该订单已超时，需要重新下单哦~',
                        showCancel: false,
                        success: function(res) {
                            if (res.confirm) {
                                wx.switchTab({
                                    url: '/pages/me/me'
                                })
                            }
                        }
                    })
                } else {
                    wx.showToast({
                        title: '请检查网络...',
                        icon: 'loading',
                        duration: 1500
                    })
                }
            }

        })

    },
    viewOrderDetail(e) {
        let order_id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '/pages/orderInfo/orderInfo?order_id=' + order_id
        })
    },

    onShow() {
        this.getOrders()
    },
    getOrders() {
        let data = {
            page: this.data.page,
            size: this.data.size,
            order_status: this.order_status,
            user_id: this.data.user_id
        }

        var self = this
        wx.request({
            url: app.url + '/v1/orders/get_my_orders',
            method: 'POST',
            data,
            success(res) {
                var respData = res.data
                if (respData.code == '00000') {
                    var orders = respData.data.map(el => {
                        el.total_price = (el.total_price / 100).toFixed(2)
                        el.freight = (el.freight / 100).toFixed(2)
                        for (var i = 0; i < el.items.length; i++) {
                            el.items[i].book_price = (el.items[i].book_price / 100).toFixed(2)
                        }
                        el.order_at_time = utils.unixTimestamp2DateStr(el.order_at)
                        return el
                    })

                    var wait_pay_orders = []
                    var wait_send_orders = []
                    var wait_accept_orders = []
                    var accepted_orders = []

                    //每次拿到 orders 数据之后，根据订单状态将订单拆分
                    for (var i = 0; i < orders.length; i++) {
                        if (orders[i].order_status == 1) {
                            wait_pay_orders.push(orders[i])
                        } else if (orders[i].order_status == 2) {
                            wait_send_orders.push(orders[i])
                        } else if (orders[i].order_status == 3) {
                            wait_accept_orders.push(orders[i])
                        } else if (orders[i].order_status == 4) {
                            accepted_orders.push(orders[i])
                        }
                    }
                    self.setData({
                        total: respData.total,
                        orders: orders,
                    })
                    self.setData({
                        wait_pay_orders,
                        wait_send_orders,
                        wait_accept_orders,
                        accepted_orders
                    })
                }
            }
        })
    },
    onLoad(options) {
        var self = this
        self.setData({
          currentPage:options.currentPage
        })
        //页面初始加载后即刻拿到该用户【全部】类型的订单
        var user = wx.getStorageSync('user')
        self.setData({
            user_id: user.id
        })
        var shop = wx.getStorage({
            key: 'shop',
            success(res) {
                self.setData({
                    seller_tel: res.data.tel
                })
            }
        })
        //获取商户头像
        var shop = wx.getStorageSync('shop')
        self.setData({
            shop_logo: shop.logo
        })
    },

    comfirmAccept(e) {
        let order_id = e.currentTarget.dataset.id,
            self = this
        wx.request({
            url: app.url + '/v1/orders/accept_order',
            method: 'POST',
            data: {
                order_ids: [order_id]
            },
            success(res) {
                if (res.data.code == '00000') {
                    wx.navigateTo({
                        url: '/pages/orderInfo/orderInfo?order_id' + order_id
                    })
                    this.getOrders()
                }
            }
        })
    },
    goToPage(e) {
        this.setData({
            currentPage: e.target.dataset.index
        })
    },
    callSeller() {
        wx.makePhoneCall({
            phoneNumber: this.data.seller_tel
        })
    },
    pageChange(e) {
        this.setData({
            currentPage: e.detail.current
        })
    },
    applyRefund(e) {
        wx.navigateTo({
            url: '/pages/refund/refund?order_id=' + e.currentTarget.dataset.id
        })
    },
    cancel_order(e) {
        let order_id = e.currentTarget.dataset.id,
            self = this
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
                            self.getOrders()
                        }
                    })

                }
            }
        })
    },
    onShareAppMessage(e) {
      return {
           title: app.shareTitle,
           path: '/pages/index/index'
       }
    }

})
