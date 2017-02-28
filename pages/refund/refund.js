var orderStatus = require('../../common/js/orderStatus.js')
var app = getApp()
Page({
    data: {
        order: {
            id: '',
            time: '',
            status: {}
        },
        images: [],
        n: 0, //已输入字数
        tell: ''
    },
    onShow: function(e) {
        var order = this.data.order
        order.id = '123456789'
        order.time = '2017/02/09 12:35:17'
        order.status = orderStatus.orderStatusDescription(1)
        this.setData({
            tell: '18818000305',
            order: order
        })
    },
    callPhone: function(e) {
        wx.makePhoneCall({
            phoneNumber: this.data.tell
        })
    },
    addPicture: function(e) {
        var self = this
        var images = self.data.images
        var con = 3 - images.length
        wx.chooseImage({
            count: 2, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function(res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
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
        images.splice(index,1)
        console.log(index);
        this.setData({
            images: images
        })
    },
    onShareAppMessage(e) {
      return {
           title: app.shareTitle,
           path: '/pages/index/index'
       }
    }
})
