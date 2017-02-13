Page({
    data: {
        remark: ''
    },
    bindChange: function(e) {
        this.setData({
            remark: e.detail.value
        })
    },
    prePage: function(e) {
        var remark = this.data.remark.trim()
        if (remark != '') {
            var pages = getCurrentPages();
            if (pages.length > 1) {
                var prePage = pages[pages.length - 2];
                prePage.changeRemake(this.data.remark)
            }
        }
        wx.navigateBack({
            delta: 1
        })
    }
})
