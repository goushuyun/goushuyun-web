var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js')
var qqmapsdk

Page({
    onLoad: function() {
        // 实例化API核心类
        qqmapsdk = new QQMapWX({
            key: 'Q4XBZ-OV6W4-636UU-D7BLU-RI7SH-65FWN'
        })
    },
    chooseAddress() {

        console.log('kaiakiakaiu')

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


    data: {
        search_val: '',
        school: ''
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
