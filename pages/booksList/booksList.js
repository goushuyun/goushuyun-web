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

        total_number: 0,

        // topic_id
        topic_id: '',

        // search forward
        search_val_is_isbn: false,
        search_val: ''
    },

    enterSearch(e){
        this.standardSearch(e.detail.value)
    },

    getData() {
        // 判断检索的是否是话题数据
        if(this.topic_id){
            console.log('The topic id is : ' + this.data.topic_id);
            this.getTopicData()
            return
        }

        //list all books of this category
        var app = getApp(),
            data = {}
        data.category = this.category
        data.shop_id = app.shop_id
        data.page = this.data.page
        data.size = this.data.size
        data.min_number = 1

        // 添加搜索条件
        if(this.data.search_val != ''){
            if(this.data.search_val_is_isbn){
                data.isbn = this.data.search_val
            }else{
                data.author = data.publisher = data.title = this.data.search_val
            }
        }

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
                wx.hideToast()
            }
        })
    },
    getMore() {
        let page = this.data.page + 1
        //判断是否去做新的请求
        let total_page_number = Math.ceil(this.data.total_number / this.data.size)

        if (page <= total_page_number) {
            wx.showToast({
                title: '加载中...',
                icon: 'loading',
                duration: 10000
            })
            this.setData({
                page: page
            })

            this.getData()
        }
    },

    // 获取话题数据
    getTopicData(){
        let params = {
            topic_id: this.data.topic_id,
            page: this.data.page,
            size: this.data.size,
            min_number: 1,
            shop_id: app.shop_id
        }

        var self = this
        wx.request({
            url: app.url + '/v1/books/listBooksHideSameIsbn',
            data: params,
            method: "POST",
            success: function(res) {
                self.setData({
                    books: self.data.books.concat(res.data.data),
                    total_number: res.data.total
                })
                wx.hideToast()
            }
        })

    },


    onLoad: function(options) {
        console.log(options)
        var self = this
        var title = options.title
        if (options.title) {
            wx.setNavigationBarTitle({
                title: options.title
            })
        }
        var search_input_default_val = ''
        var app = getApp(),
            data = {shop_id: app.shop_id}
        if (options.topic_id != undefined) {
            // 将 话题ID 写入 data
            this.setData({
                topic_id: options.topic_id
            })

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
                        books: res.data.data,
                        total_number: res.data.total
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
                self.setData({
                    search_val_is_isbn: true
                })
            } else {
                //the value is text, maybe title, author, publisher
                data.author = data.publisher = data.title = search_val
            }

            self.setData({
                search_val
            })

            wx.request({
                url: app.url + '/v1/books/listBooksHideSameIsbn',
                method: "POST",
                data: data,
                success(res) {
                    //set new result books
                    self.setData({
                        books: res.data.data,
                        total_number: res.data.total
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

    standardSearch(search_val){
        if(search_val.trim == '') return

        var app = getApp(), self = this
        let data = {
            shop_id: app.shop_id,
            page: this.data.page,
            size: this.data.size,
            min_number: 1
        }

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
                self.setData({
                    books: res.data.data

                })

                var temData = self.data.wxSearchData;
                temData.view.isShow = false;
                self.setData({
                    wxSearchData: temData
                });
            }
        })

    },


    wxSearchFn: function(e) {
        var that = this
        WxSearch.wxSearchAddHisKey(that);

        //the value in input is this.data.wxSearchData.value
        let search_val = this.data.wxSearchData.value

        this.standardSearch(search_val)
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
