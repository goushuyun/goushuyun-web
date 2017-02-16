Page({
    data: {
        remark: ''
    },
    onShow: function(e) {
        var remark = wx.getStorageSync('remark')
        if (remark != '') {
            this.setData({
                remark: remark
            })
        }
    },
    formSubmit: function(e) {
        var remarkinfo = e.detail.value
        var remark = remarkinfo.remark
        if (remark != '') {
            var pages = getCurrentPages();
            if (pages.length > 1) {
                var prePage = pages[pages.length - 2];
                prePage.changeRemark(remark)
            }
        }
        // wx.removeStorageSync('remark')
        wx.navigateBack({
            delta: 1
        })
    }
})
