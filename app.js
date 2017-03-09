App({
    onLaunch() {
        //while app onLaunch, user login and get user info
        var self = this
        //user login
        wx.login({
            success(res) {
                console.log(res)

                if (res.code) {
                    // login success
                    wx.request({
                        url: self.url + '/v1/weixin/getKeyAndOpenid',
                        data: {
                            code: res.code
                        },
                        method: "POST",
                        success(res) {
                            console.log(res)

                            //met error
                            if (res.data.code != '00000') {
                                return
                            }

                            //save user info into localstorage
                            wx.setStorage({
                                key: 'user',
                                data: {id:res.data.user.id}
                            })
                            var session_key = res.data.session_key

                            // get user info and save them to db
                            wx.getUserInfo({
                                success(res) {
                                    let data = {}
                                    data.session_key = session_key
                                    data.encrypted_data = res.encryptedData
                                    data.iv = res.iv
                                    console.log("**********************")
                                    console.log(data)
                                    console.log("**********************")

                                    wx.request({
                                        url: self.url + '/v1/weixin/DecryptUserInfo',
                                        data: data,
                                        method: "POST",
                                        success(res) {
                                            console.log(res)

                                            if (res.data.code == '00000') {
                                                //save user info into localstorage
                                                wx.setStorage({
                                                    key: 'user',
                                                    data: res.data.user
                                                })
                                            }

                                        }
                                    })

                                }
                            })

                            let app = getApp()
                            let shop_id = app.shop_id

                            // save openid & session_key into localstorage
                            wx.setStorage({
                                key: "openid",
                                data: res.data.user.openId
                            })

                            wx.setStorage({
                                key: "session_key",
                                data: session_key
                            })

                            // save shop name into localstorage
                            wx.request({
                                url: self.url + '/v1/admin/getShopInfo',
                                data: {
                                    id: shop_id
                                },
                                header: {
                                    'content-type': 'application/json'
                                },
                                method: 'POST',
                                success: function(res) {
                                    if (res.data.code != '00000') {
                                        return
                                    }
                                    var shop = res.data.data
                                    wx.setStorage({
                                        key: "shop",
                                        data: shop
                                    })
                                }
                            })
                        }
                    })

                } else {
                    //login fail
                }
            }
        })
    },

    // shareTitle: '让买卖教材简单点', //购书宝+
    // url: 'https://app.boxcumpus.com', //购书宝+
    // banners: ['http://okxy9gsls.bkt.clouddn.com/banner1.jpg','http://okxy9gsls.bkt.clouddn.com/banner2.jpg'],
    // url: 'https://app.cumpusbox.com', //购书云
    url: 'https://app.goushuyun.com', //测试
    shareTitle: '新书、二手书售卖及配送', //购书云
    banners: ['http://okxy9gsls.bkt.clouddn.com/banner4.jpg','http://okxy9gsls.bkt.clouddn.com/banner3.jpg'],

    // shop_id: "17012600000001"
    shop_id: "17030800000001"  //测试
})


require('./libs/wx-pro.js')
