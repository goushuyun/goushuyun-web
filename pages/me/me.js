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
        page: 1,
        size: 10,
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
            user_id: this.data.user_id,

        }

        console.log(data)

        var self = this
        wx.request({
            url: 'https://app.cumpusbox.com/v1/orders/get_my_orders',
            method: 'POST',
            data,
            success(res){

                var respData = res.data

                console.log(respData)

                if(respData.code == '00000'){
                    self.setData({
                        total: respData.total,
                        orders: respData.data.map(el=>{
                            el.total_price = (el.total_price/100).toFixed(2)
                            el.freight = (el.freight/100).toFixed(2)

                            for (var i = 0; i < el.items.length; i++) {
                                el.items[i].book_price = (el.items[i].book_price/100).toFixed(2)
                            }

                            el.order_at_time = utils.unixTimestamp2DateStr(el.order_at)

                            console.log(el.order_at_time)

                            return el
                        })
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

        this.getOrders()
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
