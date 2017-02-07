Page({
    data: {
        address_info: '点击选择'
    },


    choAddress() {
        var self = this
        wx.chooseLocation({
            success(res){
                console.log(res)
                self.setData({
                    address_info: res.address
                })
            }
        })


    }
})
