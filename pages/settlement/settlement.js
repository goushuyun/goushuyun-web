var app = getApp()
Page({
    data: {
        addresses: [],
        address: {},
        shopName: '',
        items: [],
        total_price: 0,
        total_number: 0,
        freight: 0, //配送费
        remake: '无备注信息'
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

        /* 回写总数量，方便提交订单使用 */
        self.setData({
            total_number: total_number
        })

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
    },
    writeRemark: function(e) {
        wx.navigateTo({
            url: '/pages/remark/remark'
        })
    },
    changeRemake: function(remake) {
        this.setData({
            remake: remake
        })
    },
    changeAddress: function(address) {
        this.setData({
            address: address
        })
    },
    submitSettlement: function(e) {
        var self = this

        if (self.data.address == undefined || self.data.addAddress == null) {
            wx.showModal({
                title: '提示',
                content: '尚未选择地址，请前往设置地址！',
                success: function(res) {
                    if (res.confirm) {
                        self.selectAddress()
                    } else {
                        return
                    }
                }
            })
        }

        var items = self.data.items
        for (var i = 0; i < items.length; i++) {
            items[i] *= 100
        }
        var order = {
            address: self.data.address,
            items: items,
            total_price: this.data.total_price *= 100,
            total_number: this.data.total_number,
            remake: this.data.remake,
            address: this.data.address
        }

        // wx.request({
        //     url: 'https://app.cumpusbox.com/v1/......',
        //     data: order,
        //     method: 'POST'.
        //     success: function(res) {
        //         console.log(res);
        //     }
        // })
    }
})
