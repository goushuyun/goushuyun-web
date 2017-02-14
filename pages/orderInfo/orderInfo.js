Page({
    data: {
        shopName: "",
        address: {
            user_name: "冯忠森",
            tel: "18818000305",
            address: "上海应用技术大学"
        },
        order_status: {
            code: 1,
            massage: "等待卖家发货"
        }
    },
    onLoad: function(e) {
        var self = this
        wx.getStorage({
            key: 'shop',
            success: function(res) {
                var shop_name = res.data.shop_name.trim()
                self.setData({
                    shopName: shop_name
                })
            }
        })
    },
    shopDetail(e) {
        wx.navigateTo({
            url: '/pages/shopDetail/shopDetail'
        })
    }
})
