Page({
    data: {
        search_val: ''
    },
    bindchange(e){
        this.setData({
            search_val: e.detail.value
        })
    },
    search(e){
        wx.navigateTo({
            url: '/pages/booksList/booksList?search_val=' + this.data.search_val
        })
    },

    chooseCategory(e){
        wx.navigateTo({
            url: '/pages/booksList/booksList?category=' + e.currentTarget.dataset.category
        })
    }
})
