//index.js
//获取应用实例
var WxSearch = require('../../wxSearch/wxSearch.js')
var app = getApp()
Page({
    data: {
        //books to list
        books: [],
        category: 0,
        page: 1,
        size: 10,

        total_number: 0
    },

    getData() {
        //list all books of this category
        var app = getApp(),
            data = {}
        data.category = this.category
        data.shop_id = app.shop_id
        data.page = this.data.page
        data.size = this.data.size
        data.min_number = 1
        var self = this
        wx.request({
            url: app.url + '/v1/books/listBooksHideSameIsbn',
            method: 'POST',
            data: data,
            success(res) {
                if (res.data.code == '00000') {
                    console.log(res.data.data)

                    // query data success
                    self.setData({
                        books: self.data.books.concat(res.data.data),
                        total_number: res.data.total
                    })

                }
            }
        })
    },
    getMore() {
        let page = this.data.page + 1
        //判断是否去做新的请求
        let total_page_number = Math.ceil(this.data.total_number / this.data.size)

        if (page <= total_page_number) {
            this.setData({
                page: page
            })

            this.getData()
        }
    },
    onLoad: function(options) {
        console.log(options)
        var self = this
        var search_input_default_val = ''
        var app = getApp(),
            data = {shop_id: app.shop_id}
        if (options.topic_id != undefined) {
            //话题罗列

            data.topic_id = options.topic_id
            data.page = this.data.page
            data.size = this.data.size
            data.min_number = 1
            wx.request({
                url: app.url + '/v1/books/listBooksHideSameIsbn',
                data: data,
                method: "POST",
                success: function(res) {
                    self.setData({
                        books: res.data.data
                    })
                }
            })
        }else if (options.search_val != undefined){
            //搜索罗列
            let search_val = options.search_val
            search_input_default_val = search_val

            //search_val is not null
            data.page = this.data.page
            data.size = this.data.size
            data.min_number = 1
            //according search_val, to searching
            if (/^\d{10,13}$/.test(search_val)) {
                //the value is isbn
                data.isbn = search_val
            } else {
                //the value is text, maybe title, author, publisher
                data.author = data.publisher = data.title = search_val
            }

            wx.request({
                url: app.url + '/v1/books/listBooksHideSameIsbn',
                method: "POST",
                data: data,
                success(res) {
                    //set new result books
                    self.setData({
                        books: res.data.data
                    })
                }
            })

        }else {
            //类别罗列
            
            this.category = options.category
            this.getData()
        }

        //初始化的时候渲染wxSearchdata
        WxSearch.init(self, search_input_default_val, 44, []);
        WxSearch.initMindKeys([]);
    },

    wxSearchFn: function(e) {
        var that = this
        WxSearch.wxSearchAddHisKey(that);

        //the value in input is this.data.wxSearchData.value
        let search_val = this.data.wxSearchData.value,
            data = {
                page: this.data.page,
                size: this.data.size,
                min_number: 1
            },
            app = getApp()
        data.shop_id = app.shop_id

        if (/^\d{10,13}$/.test(search_val)) {
            // isbn
            data.isbn = search_val
        } else {
            //text
            data.title = data.author = data.publisher = search_val
        }

        wx.request({
            url: app.url + '/v1/books/listBooksHideSameIsbn',
            method: "POST",
            data: data,
            success(res) {
                //set new result books
                that.setData({
                    books: res.data.data
                })

                console.log(res)
            }
        })
    },
    wxSearchInput: function(e) {
        var that = this
        WxSearch.wxSearchInput(e, that);
    },
    wxSerchFocus: function(e) {
        var that = this
        WxSearch.wxSearchFocus(e, that);
    },
    wxSearchBlur: function(e) {
        var that = this
        WxSearch.wxSearchBlur(e, that);
    },
    wxSearchKeyTap: function(e) {
        var that = this
        WxSearch.wxSearchKeyTap(e, that);
    },
    wxSearchDeleteKey: function(e) {
        var that = this
        WxSearch.wxSearchDeleteKey(e, that);
    },
    wxSearchDeleteAll: function(e) {
        var that = this;
        WxSearch.wxSearchDeleteAll(that);
    },
    wxSearchTap: function(e) {
        var that = this
        WxSearch.wxSearchHiddenPancel(that);
    },

    goBuyPage(e) {
        let isbn = e.currentTarget.dataset.isbn

        // 跳转到 buyPage
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
