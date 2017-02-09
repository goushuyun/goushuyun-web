Page({
    pay() {
        wx.showModal({
            title: '提示',
            content: '这是一个模态弹窗',
            showCancel: false,
            success: function(res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                }
            }
        })
    }
})

//string=nonceStr=f721c4416c95468e9896b9ec5f1dce28&package=prepay_id=wx2017020813175565e8532bda0345137584&signType=MD5&timeStamp=1486559875&key=HufL1dE34sJvjhkOm90oWRBke246AWhw
