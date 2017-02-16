var app = getApp()
Page({
    data: {
        addresses: [],
        address: {
            name: '请选择地址',
            tel: '',
            address: '',
            is_default: false, //是否是默认地址
            id: '' //地址ID
        },
        shopName: '',
        items: [],
        total_price: 0,
        total_number: 0,
        freight: 0, //配送费
        remark: ''
    },
    onShow: function(e) {
        var self = this
        /* 请求该用户默认地址 */
        var user_id = wx.getStorageSync('user').id
        wx.request({
            url: 'https://app.cumpusbox.com/v1/address/GetMyAddresses',
            data: {
                user_id: user_id
            },
            method: 'POST',
            success: function(res) {
                var addresses = res.data.data
                var address = {
                    name: '请选择地址',
                    tel: '',
                    address: '',
                    is_default: false, //是否是默认地址
                    id: '' //地址ID
                }
                self.setData({
                    address: address
                })
                if (addresses.length == 0) {
                    return
                }
                for (var i = 0; i < addresses.length; i++) {
                    if (addresses[i].is_default) {
                        self.setData({
                            address: addresses[i]
                        })
                        break
                    }
                }
            }
        })
    },
    onLoad: function(e) {
        var self = this
        /* 获得商铺信息 */
        wx.getStorage({
            key: 'shop',
            success: function(res) {
                console.log(res);
                var shop_name = res.data.shop_name
                self.setData({
                    shopName: shop_name
                })
            }
        })
        /* 取出购物车传过来的参数 */
        var shopCartData = wx.getStorageSync('shopCartData')
        wx.removeStorage({
            key: 'shopCartData'
        })

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
        var have_change = false
        console.log(this.data.remark);
        if (this.data.remark != '') {
            var have_change = true
        }
        wx.navigateTo({
            url: '/pages/remark/remark?remark=' + this.data.remark + '&have_change=' + have_change
        })
    },
    changeRemark: function(remark) {
        this.setData({
            remark: remark
        })
    },
    submitSettlement: function(e) {
        var self = this

        /* 如果尚未选择低脂，自动跳转到地址列表 */
        if (!self.data.address.is_default) {
            self.selectAddress()
            return
        }

        var items = self.data.items
        var itemIds = []
        for (var i = 0; i < items.length; i++) {
            var item = {
                id: items[i].id,
                goods_id: items[i].goods_id,
                number: items[i].number
            }
            itemIds.push(item)
        }
        var shop_id = getApp().shop_id
        var order = {
            user_id: wx.getStorageSync('user').id,
            items: itemIds,
            address_info: self.data.address,
            school: wx.getStorageSync('school'),
            total_price: 1, //this.data.total_price * 100,
            total_amount: this.data.total_number,
            remark: this.data.remark,
            freight: this.data.freight * 100,
            openid: wx.getStorageSync('openid'),
            shop_id: shop_id
        }

        console.log(order)

        wx.request({
            url: 'https://app.cumpusbox.com/v1/orders/PlaceOrder',
            data: order,
            method: 'POST',
            success: function(res) {
                if (res.data.message == 'ok') {
                    var payInfo = res.data.data
                    var order_id = res.data.order_id
                    console.log('-------------------------------------------------------------');
                    console.log(order_id);
                    wx.requestPayment({
                        timeStamp: payInfo.timeStamp,
                        nonceStr: payInfo.nonceStr,
                        package: payInfo.package,
                        signType: 'MD5',
                        paySign: payInfo.paySign,
                        complete: function(res) {
                            wx.navigateTo({
                                url: '/pages/orderInfo/orderInfo?order_id='+order_id
                            })
                        }
                    })
                } else {
                    wx.navigateBack({
                        delta: 1
                    })
                }
            }
        })
    },
    shopDetail(e) {
        wx.navigateTo({
            url: '/pages/shopDetail/shopDetail'
        })
    }
})
