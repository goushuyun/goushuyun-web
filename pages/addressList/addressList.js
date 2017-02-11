Page({
    data: {
        addresses: []
    },
    onShow: function(e) {
        var self = this
        wx.request({
            url: 'https://app.cumpusbox.com/v1/address/GetMyAddresses',
            data: {
                user_id: wx.getStorageSync('user').id
            },
            method: 'POST',
            success: function(res) {
                if (res.data.code == '00000') {
                    self.setData({
                        addresses: res.data.data
                    })
                }
            }
        })
    },
    selectAddress: function(e) {
        var index = parseInt(e.currentTarget.dataset.index)
        var address = this.data.addresses[index]
        var pages = getCurrentPages();
        var prePage = pages[pages.length - 2];
        prePage.changeAddress(address)
        wx.navigateBack({
            delta: 1
        })
    },
    addAddress: function(e) {
        wx.navigateTo({
            url: "/pages/addAddress/addAddress?opt=add"
        })
    },
    updataAddress: function(e) {
        var index = e.currentTarget.dataset.index
        var address = this.data.addresses[index]
        var addressString = JSON.stringify(address)
        wx.navigateTo({
            url: "/pages/addAddress/addAddress?opt=update&addressString="+addressString
        })
    }
})
