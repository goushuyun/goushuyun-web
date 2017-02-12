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

        wx.request({
            url: 'https://app.cumpusbox.com/v1/users/SetDefaultAddress',
            data: {
                id: wx.getStorageSync('user').id,
                default_address_id: address.id
            },
            method: 'POST',
            success: function(res) {
                wx.navigateBack({
                    delta: 1
                })
            }
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
        console.log(addressString);
        wx.navigateTo({
            url: "/pages/addAddress/addAddress?opt=update&addressString=" + addressString
        })
    }
})
