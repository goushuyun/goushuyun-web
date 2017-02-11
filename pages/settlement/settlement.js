var app = getApp()
Page({
    data: {
        addresses: [],
        address: {},
        shopName: '',
        items: [],
        total_price: '',
        freight: 0 //配送费
    },
    // onShow: function(e) {
    //     var self = this
    //     /* 请求该用户默认地址 */
    //     var user_id = wx.getStorageSync('user').id
    //     wx.request({
    //         url: 'https://app.cumpusbox.com/v1/......',
    //         data: {
    //             id: user_id
    //         },
    //         header: {
    //             'content-type': 'application/json'
    //         },
    //         success: function(res) {
    //             var addresses = res.data.addresses
    //             if (addresses.length == 0) {
    //                 return
    //             }
    //             var address;
    //             for(var i = 0; i< addresses.length;i++){
    //                 if (addresses[i].default) {
    //                     address = addresses[i]
    //                     break
    //                 }
    //             }
    //
    //             self.setData({
    //                 addresses:
    //             })
    //             console.log(res.data)
    //         }
    //     })
    // },
    onLoad: function(option) {
        var self = this
        /* 获得商铺信息 */
        wx.getStorage({
            key: 'shop',
            success: function(res) {
                var shop_name = res.shop_name
                self.setData({
                    shopName: shop_name
                })
            }
        })

        /* 取出购物车传过来的参数 */
        var shopCartData = JSON.parse(option.shopCartData)
        var items = shopCartData.items
        var total_price = parseFloat(shopCartData.total_price)

        /* 计算 配送费 = 首件费用 +（数量-1）*续件费用*/
        /* 计算商品总数 */
        var total_number = 0
        for (var i = 0; i < items.length; i++) {
            total_number += items[i].number
        }

        /* 计算配送费、总金额（含配送费） */
        var first_one_fee = 6
        var after_one_fee = 2
        var freight = first_one_fee + (total_number - 1) * after_one_fee
        total_price += freight

        /* 回写数据 */
        self.setData({
            items: items,
            total_price: total_price.toFixed(2),
            freight: freight
        })
    },
    selectAddress: function(e) {
        wx.navigateTo({
            url: '/pages/addressList/addressList'
        })
    }
})
