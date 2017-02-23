Page({
    data: {
        name: '',
        tel: '',
        address_info: '点击选择',
        house_num: '',
        address_id: '',
        id_default: false,
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
            var house_num = ''
            if (address_house.length > 1) { //未添加门牌号
                house_num = address_house[1]
            }
            self.setData({
                name: addressJson.name,
                tel: addressJson.tel,
                address_info: address_info,
                house_num: house_num,
                address_id: addressJson.id,
                id_default: addressJson.id_default,
                oprate: 'update'
            })
        }
    },
    formSubmit: function(e) {
        var self = this
        var address = e.detail.value
        self.setData({
            name: address.name,
            tel: address.tel,
            address_info: address.address_info,
            house_num: address.house_num
        })
        self.addressHandle(e)
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
        var user_id = wx.getStorageSync('user').id
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
                user_id: user_id,
                info: info
            }
        } else {
            var url = 'https://app.cumpusbox.com/v1/address/updateAddress'
            var id = self.data.address_id
            var data = {
                address_id: id,
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
                    console.log('----------------------------------------------');
                    console.log('self.data.oprate---' + self.data.oprate);
                    console.log('res.address_id---' + res.data.address_id);
                    console.log('self.data.address_id---' + self.data.address_id);
                    var default_address_id = (self.data.oprate == 'add') ? res.data.address_id : self.data.address_id
                    console.log('default_address_id---'+default_address_id);
                    wx.request({
                        url: 'https://app.cumpusbox.com/v1/users/SetDefaultAddress',
                        data: {
                            id: user_id,
                            default_address_id: default_address_id
                        },
                        method: 'POST',
                        success: function(res) {
                            wx.navigateBack({
                                delta: 2
                            })
                        }
                    })
                }
            }
        })
    },
    addressDelet: function(e) {
        var self = this
        wx.showModal({
            content: '确认删除该地址吗？',
            success: function(res) {
                if (res.confirm) {
                    var address_id = self.data.address_id
                    wx.request({
                        url: 'https://app.cumpusbox.com/v1/address/deleteAddress',
                        data: {
                            address_id: address_id
                        },
                        method: 'POST',
                        success: function(res) {
                            if (res.code = '00000') {
                                wx.request({
                                    url: 'https://app.cumpusbox.com/v1/users/SetDefaultAddress',
                                    data: {
                                        id: wx.getStorageSync('user').id,
                                        default_address_id: 'null'
                                    },
                                    method: 'POST',
                                    success: function(res) {
                                        wx.navigateBack({
                                            delta: 1
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
            }
        })
    },
    onShareAppMessage(e) {
      return {
           title: '购书云',
           desc: '新书、二手书售卖及配送',
           path: '/pages/index'
       }
    }
})
