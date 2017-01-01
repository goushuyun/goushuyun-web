Page({
    data: {
        tabs: ['全部','待付款','待发货','待收货','待评价'],
        currentPage: 0
    },
    goToPage(e){
        this.setData({
            currentPage: e.target.dataset.index
        })
    },
    pageChange(e){
        this.setData({
            currentPage: e.detail.current
        })
    }
})
