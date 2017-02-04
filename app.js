App({
    onLaunch() {
        //while app onLaunch, user login and get user info
        console.log('onLaunch')

        //user login
        wx.login({
            success(res) {
                console.log(res)

                if (res.code) {
                    // login success
                    wx.request({
                        url: "https://app.cumpusbox.com/v1/weixin/getKeyAndOpenid",
                        data: {code: res.code},
                        method: "POST",
                        success(res){
                            console.log(res)

                            //met error
                            if(res.data.code != '00000'){
                                return
                            }

                            var session_key = res.data.session_key

                            // get user info and save them to db
                            wx.getUserInfo({
                                success(res){
                                    let data = {}
                                    data.session_key = session_key
                                    data.encrypted_data = res.encryptedData
                                    data.iv = res.iv
                                    console.log("**********************")
                                    console.log(data)
                                    console.log("**********************")

                                    wx.request({
                                        url: "https://app.cumpusbox.com/v1/weixin/DecryptUserInfo",
                                        data: data,
                                        method: "POST",
                                        success(res){
                                            console.log(res)

                                            if(res.data.code == '00000'){
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
                                data: res.data.openid
                            })

                            wx.setStorage({
                                key: "session_key",
                                data: session_key
                            })
                        }
                    })

                } else {
                    //login fail
                }
            }
        })
    },

    "shop_id": "17012600000001"

})



// https://api.weixin.qq.com/sns/jscode2session?appid=wx34556be661dae586&secret=cd4fd24134463d81e6e0fd727c4f6d78&js_code=013e4yOh1VBg1z0P7BOh1POvOh1e4yOI&grant_type=authorization_code

// curl -L -v https://api.weixin.qq.com/sns/jscode2session?appid=wx34556be661dae586&secret=cd4fd24134463d81e6e0fd727c4f6d78&js_code=003fL1Zb0QvCdv1FNDXb0i27Zb0fL1ZR&grant_type=authorization_code
