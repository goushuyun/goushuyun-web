var utils = require('../../libs/utils')
var app = getApp()
Page({
    data: {
        avatar: '',
        user_id: '',
        orders_amount: [],
        base_urls: [
            'http://okxy9gsls.bkt.clouddn.com/goushuyun_QRcode.jpg'
        ],
        in_after_sale_amount: 0
    },
    goToOrder(e) {
        wx.navigateTo({
            url: '/pages/me/me?currentPage=' + e.currentTarget.dataset.category
        })
    },
    goToAfterSale(e) {
        wx.navigateTo({
            url: '/pages/me/me?show_after_sale=true'
        })
    },
    onShow() {
        var self = this
        //页面初始加载后即刻拿到该用户【全部】类型的订单
        var user = wx.getStorageSync('user')
        var avatarUrl = ''
        if (!user.avatarUrl) {
            avatarUrl = '/images/default_avatar.png'
        } else {
            avatarUrl = user.avatarUrl
        }
        self.setData({
            avatar: avatarUrl,
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
        wx.request({
            url: app.url + '/v1/orders/get_orders_amount',
            data: {
                user_id: user.id
            },
            method: 'POST',
            success(res) {
                if (res.data.code == '00000') {
                    self.setData({
                        orders_amount: res.data.data,
                        in_after_sale_amount: res.data.in_after_sale_amount
                    })
                }
            }
        })
    },
    address_manage() {
        wx.navigateTo({
            url: '/pages/addressList/addressList'
        })
    },
    shopInfo() {
        wx.navigateTo({
            url: '/pages/shopDetail/shopDetail'
        })
    },
    shareApp(e) {
        var index = parseInt(this.data.base_urls.length * Math.random())
        var urls = []
        urls.push(this.data.base_urls[index])
        wx.previewImage({
            current: '', // 当前显示图片的http链接
            urls: urls // 需要预览的图片http链接列表
        })
    },
    onShareAppMessage(e) {
        return {
            title: app.shareTitle,
            path: '/pages/index/index'
        }
    }

})
