App({
    onLaunch(){
        console.log('kai')
        wx.login({
            success(res){
                console.log(res)
            }
        })
    },
    onShow(){
        wx.getUserInfo({
            success(res){
                console.log(res)
            }
        })
    }
})

//https://api.weixin.qq.com/sns/jscode2session?appid=wx34556be661dae586&secret=cd4fd24134463d81e6e0fd727c4f6d78&js_code=003VfFfS0447Pb20bdgS0wrGfS0VfFft&grant_type=authorization_code


//"003VfFfS0447Pb20bdgS0wrGfS0VfFft"
