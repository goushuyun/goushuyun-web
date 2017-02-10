var app = getApp()
Page({
    data: {
        shopImg: '',
        shopName: '',
        tell: '',
        address: '',
        description: ''
    },
    onShow: function(e) {
        var self = this
        var shopId = app.shop_id
        wx.request({
            url: 'https://app.cumpusbox.com/v1/admin/getShopInfo',
            data: {
                id: shopId
            },
            header: {
                'content-type': 'application/json'
            },
            method: 'POST',
            success: function(res) {
                if (res.data.code != '00000') {
                    return
                }
                var shopInfo = res.data.data
                self.setData({
                    shopImg: shopInfo.logo,
                    shopName: shopInfo.shop_name.trim(),
                    tell: shopInfo.tel,
                    address: shopInfo.address,
                    description: shopInfo.introduction
                })
            },
            fail: function(res) {
                console.log(res)
            }
        })
    },
    callPhone: function(e) {
        wx.makePhoneCall({
            phoneNumber: this.data.tell
        })
    }
})
