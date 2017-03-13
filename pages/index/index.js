var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js')
var qqmapsdk
var app = getApp()
Page({
    data: {
        search_val: '',
        school: '',
        topics: [],
        banners: app.banners
    },
    onLoad: function(e) {
        var self = this
        var shop_id = app.shop_id
        var tmp_topics = []
        wx.pro.request({
                url: app.url + '/v1/activity/list_topics',
                data: {
                    shop_id: shop_id
                },
                method: 'POST'
            })
            .then(res => {
                for (var i = 0; i < res.data.length; i++) {
                    if (!res.data[i].recommend) continue

                    //被推荐的话题
                    (function(topic) {

                        wx.pro.request({
                            url: app.url + '/v1/books/listBooksHideSameIsbn',
                            data: {
                                shop_id: shop_id,
                                topic_id: topic.id,
                                min_number: 1,
                                page: 1,
                                size: 10
                            },
                            method: "POST"
                        }).then(res => {
                            if(res.total > 0){
                                topic.books = res.data
                                tmp_topics.push(topic)

                                self.setData({
                                    topics: tmp_topics
                                })
                            }
                        })

                    })(res.data[i])
                }
            })
        // 实例化API核心类
        qqmapsdk = new QQMapWX({
            key: 'Q4XBZ-OV6W4-636UU-D7BLU-RI7SH-65FWN'
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
                wx.setNavigationBarTitle({
                    title: school
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
    confrim_search(e) {
        var search_val = e.detail.value.trim()
        if (search_val != "") {
            wx.navigateTo({
                url: '/pages/booksList/booksList?search_val=' + search_val
            })
        }
    },
    search(e) {
        var search_val = this.data.search_val.trim()

        if (search_val != "") {
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
    },
    onShareAppMessage(e) {
        return {
            title: app.shareTitle,
            path: '/pages/index/index'
        }
    }
})
