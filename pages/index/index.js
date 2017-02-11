Page({
    data: {
        search_val: ''
    },
    scan() {
        console.log('scan')

        wx.scanCode({
            success: (res) => {
                let isbn = res.result
                wx.navigateTo({
                    url: '/pages/booksList/booksList?search_val=' + isbn
                })
            }
        })
    },
    bindchange(e) {
        this.setData({
            search_val: e.detail.value
        })
    },
    search(e) {
        wx.navigateTo({
            url: '/pages/booksList/booksList?search_val=' + this.data.search_val
        })
    },

    chooseCategory(e) {
        wx.navigateTo({
            url: '/pages/booksList/booksList?category=' + e.currentTarget.dataset.category
        })
    }
})
