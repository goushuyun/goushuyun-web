Page({
    data: {
        tabs: ['全部', '待付款', '待发货', '待收货', '待评价'],
        currentPage: 0
    },
    goToPage(e) {
        this.setData({
            currentPage: e.target.dataset.index
        })
    },
    call() {
        console.log('asdfasdfasd')
        wx.makePhoneCall({
            phoneNumber: '18817953402'
        })
    },
    pageChange(e) {
        this.setData({
            currentPage: e.detail.current
        })
    },
    cancel_order() {
        wx.showModal({
            // title: '提示',
            content: '您确定要取消该订单吗？',
            success: function(res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                }
            }
        })
    }




})
