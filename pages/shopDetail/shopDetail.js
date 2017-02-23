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
      wx.getStorage({
          key: 'shop',
          success: function(res) {
              var shopInfo = res.data
              self.setData({
                  shopImg: shopInfo.logo,
                  shopName: shopInfo.shop_name.trim(),
                  tell: shopInfo.tel,
                  address: shopInfo.address,
                  description: shopInfo.introduction
              })
          }
      })
    },
    callPhone: function(e) {
        wx.makePhoneCall({
            phoneNumber: this.data.tell
        })
    },
    onShareAppMessage(e) {
      return {
           title: '新书、二手书售卖及配送',
           path: '/pages/index/index'
       }
    }
})
