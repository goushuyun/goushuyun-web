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
        tel: '',
        requestData: []
    },
    formSubmit: function(e) {
        var self = this
        var refund_info = e.detail.value
        var imgs = self.data.images
        var count = 0
        for (var i = 0; i < imgs.length; i++) {
          (function(img) {
              wx.pro.request({
                  url: app.url + '/v1/mediastore/getUpToken',
                  data: {
                    zone: 1,
                    key: i
                  },
                  method: "POST"
              }).then(res => {
                  console.log(res);
                  // if (res.data.message=='ok') {
                  //   wx.uploadFile({
                  //     url: 'http://upload.qiniu.com/', //仅为示例，非真实的接口地址
                  //     filePath: img,
                  //     name: 'file',
                  //     formData:{
                  //       'user': 'test'
                  //     },
                  //     success: function(res){
                  //       var data = res.data
                  //       //do something
                  //     }
                  //   })
                  // }
              })
          })(imgs[i])
        }
    },
    onLoad: function(option) {
        // var order_id = option.order_id
        // this.setData({
        //     order_id: order_id
        // })
        // this.loadingOrder(order_id)
        this.loadingOrder()
    },
    loadingOrder: function(order_id) {
        var self = this
        // var order_id = order_id
        // wx.request({
        //     url: app.url + '/v1/orders/get_my_orders',
        //     data: {
        //         page: 1, //页数   required
        //         size: 10, //每页大小  required
        //         order_id: order_id, //订单号   （获取某一订单的时候必传）
        //         user_id: wx.getStorageSync('user').id //用户ID  required
        //     },
        //     method: 'POST',
        //     success: function(res) {
        //         var present_order = res.data.data[0]

                var present_order = {
                            "user_id":"",
                            "items":[
                                {
                                    "id":"934c780c-7352-4c2f-985f-eb9583c4510d",
                                    "goods_id":"920c6ce1-bb17-49b6-b89c-dbb1b4d724bf",
                                    "user_id":"",
                                    "order_id":"",
                                    "book_title":"Java编程思想 （第4版）",
                                    "book_price":5000,      //书本价格
                                    "number":1,             //下单数量
                                    "type":1,
                                    "isbn":"9787111213826",
                                    "book_image":"",
                                    "store_number":0,
                                    "current_store_number":0,
                                    "can_order":false
                                }
                            ],
                            "address_info":{
                                "name":"此刻女",
                                "tel":"18817953402",
                                "address":"北京市门头沟区军庄镇门头沟军庄中心灰峪小学_欧诺",
                                "is_default":false,
                                "id":""
                            },
                            "school":"剑盟雅思预备学院",
                            "order_id":"17021500000042",                        //订单号
                            "total_price":10000,                                    //总价格
                            "total_amount":1,                                   //总数量
                            "client_ip":"",
                            "remark":"",
                            "freight":600,                                      //运费
                            "shop_id":"",
                            "openid":"",
                            "trade_code":"4008842001201702150033874081",        //交易号
                            "pay_at":1487175316,        //支付时间
                            "order_at":1487146492,      //下单时间
                            "pay_status":1,
                            "order_status":3
                        }
                present_order.total_price = (present_order.total_price / 100 - 5).toFixed(2)
                present_order.order_at = utils.unixTimestamp2DateStr(present_order.order_at) //下单时间
                var order_status_description = orderStatus.orderStatusDescription(present_order.order_status)

                self.setData({
                    present_order: present_order,
                    order_status_description: order_status_description
                })
        //     }
        // })
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
        var max_value = Number(this.data.present_order.total_price * 100)
        var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
        if (!reg.test(input.toString())) {
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
