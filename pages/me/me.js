var utils = require('../../libs/utils')


Page({
    data: {
        tabs: ['全部', '待付款', '待发货', '待收货', '已完成'],
        currentPage: 0,
        avatar: '',
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
        order_status: 0
    },

    onShow(){
        this.getOrders()
    },
    getOrders(){
        let data = {
            page: this.data.page,
            size: this.data.size,
            order_status: this.data.currentPage,
            user_id: this.data.user_id
        }

        var self = this
        wx.request({
            url: 'https://app.cumpusbox.com/v1/orders/get_my_orders',
            method: 'POST',
            data,
            success(res){

                var respData = res.data

                if(respData.code == '00000'){

                    var orders = respData.data.map(el=>{
                        el.total_price = (el.total_price/100).toFixed(2)
                        el.freight = (el.freight/100).toFixed(2)

                        for (var i = 0; i < el.items.length; i++) {
                            el.items[i].book_price = (el.items[i].book_price/100).toFixed(2)
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
                        switch (orders[i].order_status) {
                            case 1:
                                wait_pay_orders.push(orders[i])
                                break;
                            case 2:
                                wait_send_orders.push(orders[i])
                                break;
                            case 3:
                                wait_accept_orders.push(orders[i])
                                break;
                            case 4:
                                accepted_orders.push(orders[i])
                                break;
                        }
                    }

                    console.log(wait_send_orders)


                    self.setData({
                        total: respData.total,
                        orders: orders,
                    })
                    // wait_pay_orders: wait_pay_orders,
                    // wait_send_orders: wait_pay_orders,
                    // wait_accept_orders: wait_accept_orders,
                    // accepted_orders: accepted_orders

                    self.setData({
                        wait_send_orders
                    })


                }

            }
        })

    },
    onLoad() {
        var self = this

        //页面初始加载后即刻拿到该用户【全部】类型的订单
        var user = wx.getStorageSync('user')

        self.setData({
            avatar: user.avatarUrl,
            user_id: user.id
        })

        var shop = wx.getStorage({
            key: 'shop',
            success(res){
                self.setData({
                    seller_tel: res.data.tel
                })
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
        this.getOrders()
    },
    cancel_order() {
        wx.showModal({
            // title: '提示',
            content: '您确定要取消该订单吗？',
            success: function(res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                }
            }
        })
    }

})
