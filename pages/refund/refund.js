var orderStatus = require('../../common/js/orderStatus.js')
var utils = require('../../libs/utils.js')
var app = getApp()
Page({
    data: {
        present_order: {},
        order_status_description: {},
        input_price: '',
        n: 0, //已输入字数
        images: [],
        tel: ''
    },
    formSubmit: function(e) {
        var self = this
        var refund_info = e.detail.value
        var imgs = self.data.images

        if (!refund_info.content_desc) {
            wx.showModal({
                title: '请输入退款说明',
                showCancel: false
            })
            return
        }
        if (self.data.order_status_description.code != 2 && !refund_info.require_refund_fee) {
            wx.showModal({
                title: '请输入退款金额',
                showCancel: false
            })
            return
        }

        wx.showToast({
            title: '提交申请中...',
            icon: 'loading',
            duration: 10000
        })

        var keys = []

        /* 上传图片 */
        for (var i = 0; i < imgs.length; i++) {
            (function(img) {
                var present_key = self.data.present_order.order_id + '/' + i
                keys.push(present_key)
                wx.pro.request({
                    url: app.url + '/v1/mediastore/getUpToken',
                    data: {
                        zone: 1,
                        key: present_key
                    },
                    method: "POST"
                }).then(res => {
                    console.log(res);
                    if (res.code == '00000') {
                        var token = res.data.token
                        var keys = self.data.keys
                        wx.uploadFile({
                            url: 'https://upload.qbox.me/', //仅为示例，非真实的接口地址
                            filePath: img,
                            name: 'file',
                            formData: {
                                'key': present_key,
                                'token': token
                            }
                        })
                    }
                })
            })(imgs[i])
        }

        /* 提交售后 */
        wx.pro.request({
            url: app.url + '/v1/orders/refund_apply',
            data: {
                "trade_code": self.data.present_order.trade_code,
                "require_refund_fee": Number(self.data.order_status_description.code != 2 ? refund_info.require_refund_fee * 100 : self.data.present_order.total_price * 100),
                "total_fee": Number(self.data.present_order.total_price * 100),
                "content_desc": refund_info.content_desc,
                "images": keys.join()
            },
            method: "POST"
        }).then(res => {
            if (res.code == '00000') {
                wx.hideToast()
                wx.navigateTo({
                    url: '/pages/orderInfo/orderInfo?order_id=' + self.data.present_order.order_id
                })
            } else {
                wx.showToast({
                    title: '服务器出Bug了',
                    icon: 'loading',
                    duration: 1500
                })
            }
        })
    },
    onLoad: function(option) {
        console.log(option);
        var order_id = option.order_id
        console.log('----------------');
        console.log(order_id);
        this.setData({
            order_id: order_id
        })
        this.loadingOrder(order_id)
    },
    loadingOrder: function(order_id) {
        var self = this
        var order_id = order_id
        wx.request({
            url: app.url + '/v1/orders/get_my_orders',
            data: {
                page: 1, //页数   required
                size: 10, //每页大小  required
                order_id: order_id, //订单号   （获取某一订单的时候必传）
                user_id: wx.getStorageSync('user').id //用户ID  required
            },
            method: 'POST',
            success: function(res) {
                var present_order = res.data.data[0]
                present_order.max_value = (present_order.total_price / 100).toFixed(2)
                present_order.total_price = (present_order.total_price / 100).toFixed(2)
                console.log(present_order);
                present_order.order_at = utils.unixTimestamp2DateStr(present_order.order_at) //下单时间
                var order_status_description = orderStatus.orderStatusDescription(present_order.order_status)
                self.setData({
                    present_order: present_order,
                    order_status_description: order_status_description
                })
            }
        })
        wx.getStorage({
            key: 'shop',
            success: function(res) {
                var tel = res.data.tel
                self.setData({
                    tel: tel
                })
            }
        })
    },
    callPhone: function(e) {
        wx.makePhoneCall({
            phoneNumber: this.data.tel
        })
    },
    addPicture: function(e) {
        var self = this
        var images = self.data.images
        var con = 4 - images.length
        wx.chooseImage({
            count: con, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function(res) {
                var tempFilePaths = res.tempFilePaths
                images = images.concat(tempFilePaths)
                self.setData({
                    images: images
                })
            }
        })
    },
    deletPicture: function(e) {
        var index = parseInt(e.currentTarget.dataset.index)
        var images = this.data.images
        images.splice(index, 1)
        console.log(index);
        this.setData({
            images: images
        })
    },
    listenN(e) {
        var input_value = e.detail.value
        this.setData({
            n: input_value.length
        })
    },
    onShareAppMessage(e) {
        return {
            title: app.shareTitle,
            path: '/pages/index/index'
        }
    },
    checkMaxAmount(e) {
        var input = e.detail.value
        var input_num = Number(input * 100)
        var max_value = Number(this.data.present_order.max_value * 100)
        var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
        if (!reg.test(input.toString()) || input == 0) {
            this.setData({
                input_price: ''
            })
            return
        }
        if (input_num > max_value) {
            this.setData({
                input_price: (max_value / 100).toFixed(2)
            })
        }
    }
})
