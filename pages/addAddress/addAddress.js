Page({
    data: {
        address_info: '点击选择',
        name: '',
        tel: '',
        house_no: '',
        id: '',
        oprate: ''
    },
    onLoad: function(option) {
        var self = this
        if (option.opt == 'add') {
            self.setData({
                oprate: 'add'
            })
        } else {
            var addressJson = JSON.parse(option.addressString)
            console.log(addressJson);
            var address_house = addressJson.address.split('_')
            var address_info = address_house[0]
            var house_no = ''
            if (address_house.length > 1) { //未添加门牌号
                house_no = address_house[1]
            }
            self.setData({
                name: addressJson.name,
                tel: addressJson.tal,
                address_info: address_info,
                house_no: house_no,
                id: addressJson.id,
                oprate: 'update'
            })
        }
    },
    getName: function(e) {
        this.setData({
            name: e.detail.value
        })
    },
    getTell: function(e) {
        this.setData({
            tel: e.detail.value
        })
    },
    getHouse: function(e) {
        this.setData({
            address: e.detail.value.replace("_", " ") //用空格替换掉门牌号中所有的“_”
        })
    },
    choAddress() {
        var self = this
        wx.chooseLocation({
            success(res) {
                console.log(res)
                self.setData({
                    address_info: res.address
                })
            }
        })
    },
    addressHandle: function(e) {
        var self = this
        var data = {
            user_id: wx.getStorageSync('user').id,
            info: {
                name: self.data.name,
                tel: self.data.tel,
                address: self.data.address_info + '_' + self.data.house_no
            }
        }
        console.log(data);
        wx.request({
            url: 'https://app.cumpusbox.com/v1/address/addAddress',
            data: data,
            method: 'POST',
            success: function(res) {
                if (res.code = '00000') {
                    wx.navigateBack({
                        delta: 1
                    })
                }
            }
        })
    }
})
