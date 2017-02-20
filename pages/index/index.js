var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js')
var qqmapsdk
var app = getApp()
Page({
    data: {
        search_val: '',
        school: '',
        recommends: [],
        temp_recommends: []
    },
    onLoad: function() {
        // 实例化API核心类
        qqmapsdk = new QQMapWX({
            key: 'Q4XBZ-OV6W4-636UU-D7BLU-RI7SH-65FWN'
        })

        var self = this
        var shop_id = app.shop_id
        wx.request({
            url: 'https://app.cumpusbox.com/v1/activity/list_topics',
            data: {
                shop_id: shop_id
            },
            method: 'POST',
            success(res) {
                if (res.data.code == '00000') {
                    var recommend_items = res.data.data
                    if (recommend_items.length > 0) {
                        for (var i = 0; i < recommend_items.length; i++) {
                            var recommend_item = recommend_items[i]
                            if (recommend_item.recommend) {
                                wx.request({
                                    url: 'https://app.cumpusbox.com/v1/books/listBooks',
                                    data: {
                                        shop_id: shop_id,
                                        topic_id: recommend_item.id,
                                        page: 1,
                                        size: 10,
                                        min_number: 1
                                    },
                                    method: 'POST',
                                    success: function(res) {
                                        if (res.data.code == '00000') {
                                            var book_items = res.data.data
                                            if (book_items.length > 0) {
                                                var books = []
                                                for (var i = 0; i < book_items.length; i++) {
                                                    var book_item = book_items[i]
                                                    book_items[i].book.isbn = book_items[i].isbn
                                                    books.push(book_items[i].book)
                                                }
                                                var activity = {
                                                    recommend: recommend_item,
                                                    books: books
                                                }
                                            }
                                            var recommends = []
                                            if (self.data.temp_recommends.length > 0) {
                                                recommends.push(self.data.temp_recommends)
                                            }
                                            recommends.push(activity)
                                            self.setData({
                                                recommends: recommends
                                            })
                                            console.log(self.data.recommends);
                                        }
                                    }
                                })
                            }
                        }
                    }
                }
            }
        })
    },
    chooseAddress() {
        var self = this,
            school

        wx.chooseLocation({
            success(res) {
                if (res.name != '') {
                    school = res.name
                } else {
                    school = res.address
                }

                if (school.length > 10) {
                    school = school.substr(0, 10) + '...'
                }

                self.setData({
                    'school': school
                })

                wx.setStorage({
                    key: "school",
                    data: school
                })

            }
        })
    },
    onReady() {
        // 调用接口
        let self = this,
            school
        qqmapsdk.search({
            keyword: '大学',
            success: function(res) {

                if (res.data.length > 0) {
                    school = res.data[0].title
                } else {
                    school = '请选择学校'
                }

                self.setData({
                    school: school
                })
                wx.setStorage({
                    key: "school",
                    data: school
                })
            },
            fail: function(res) {
                console.log('---------------------------')
                console.log(res)
                console.log('---------------------------')
            }
        })
    },
    scan() {
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
    confrim_search(e){
        var search_val = e.detail.value.trim()
        if(search_val != ""){
            wx.navigateTo({
                url: '/pages/booksList/booksList?search_val=' + search_val
            })
        }
    },
    search(e) {
        var search_val = this.data.search_val.trim()

        if(search_val != ""){
            wx.navigateTo({
                url: '/pages/booksList/booksList?search_val=' + search_val
            })
        }
    },

    chooseCategory(e) {
        wx.navigateTo({
            url: '/pages/booksList/booksList?category=' + e.currentTarget.dataset.category
        })
    },
    goBuyPage(e) {
        let isbn = e.currentTarget.dataset.isbn
        console.log(isbn);
        //跳转到 buyPage
        wx.navigateTo({
            url: "/pages/buyPage/buyPage?isbn=" + isbn
        })
    }
})
