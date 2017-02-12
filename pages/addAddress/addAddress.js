Page({
    data: {
        address_info: '点击选择',
        name: '',
        tel: '',
        house_num: '',
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
            var address_house = addressJson.address.split('_')
            var address_info = address_house[0]
            var house_num = ''
            if (address_house.length > 1) { //未添加门牌号
                house_num = address_house[1]
            }
            self.setData({
                name: addressJson.name,
                tel: addressJson.tel,
                address_info: address_info,
                house_num: house_num,
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
            house_num: e.detail.value.replace("_", " ") //用空格替换掉门牌号中所有的“_”
        })
    },
    choAddress() {
        var self = this
        wx.chooseLocation({
            success(res) {
                self.setData({
                    address_info: res.address
                })
            }
        })
    },
    addressHandle: function(e) {
        var self = this

        if (self.data.name == '') {
            wx.showModal({
                title: '请输入姓名',
                showCancel: false
            })
            return
        }
        var reMobile = /^1\d{10}$/
        if (!reMobile.test(self.data.tel)) {
            wx.showModal({
                title: '请输入正确的手机号码',
                content: '例如：18818881888',
                showCancel: false
            })
            return
        }
        if (self.data.address_info == '点击选择') {
            wx.showModal({
                title: '请选择地址',
                showCancel: false
            })
            return
        }
        if (self.data.house_num == '') {
            wx.showModal({
                title: '请输入门牌号',
                showCancel: false
            })
            return
        }

        var info = {
            name: self.data.name,
            tel: self.data.tel,
            address: self.data.address_info + '_' + self.data.house_num
        }
        if (self.data.oprate == 'add') {
            var url = 'https://app.cumpusbox.com/v1/address/addAddress'
            var data = {
                user_id: wx.getStorageSync('user').id,
                info: info
            }
        } else {
            var url = 'https://app.cumpusbox.com/v1/address/updateAddress'
            var id = self.data.id
            var data = {
                id: id,
                info: info
            }
        }
        console.log(data);
        wx.request({
            url: url,
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
