Page({
    data: {
        goods: [],
        pre_price: 0,
        total_price: 0,
        total_number: 0
    },
    checkMaxAmount(e) {
        var input = e.detail.value
        let index = e.currentTarget.dataset.index
        let amount = this.data.goods[index].amount
        if (input > amount) {
            return amount
        }
    },
    addToShopCart() {
        let user_id = wx.getStorageSync('user').id,
            items = []

        //collect order items
        for (var i = 0; i < this.data.goods.length; i++) {
            let el = this.data.goods[i]
            if (el.buy_amount > 0) {
                let item = {
                    user_id: user_id
                }
                item.book_title = el.book.title //书名
                item.type = el.type //类型
                item.isbn = el.isbn //ISBN
                item.book_price = el.selling_price //售价
                item.number = el.buy_amount //购买数量
                item.goods_id = el.id //商品ID
                items.push(item)
            }
        }

        if (items.length > 0) {
            //send request to add shopcart
            wx.request({
                url: 'https://app.cumpusbox.com/v1/orders/AddToShopCart',
                data: {
                    items
                },
                method: 'POST',
                success(res) {
                    console.log(res)
                    if (res.data.code == '00000') {

                    }
                }
            })
        }
        console.log(items)

    },
    onUnload() {
        // this.addToShopCart()
        console.log("onLoad");
    },
    onHide() {
        // this.addToShopCart()
        console.log("onHide");
    },
    goToShopCart() {
        let user_id = wx.getStorageSync('user').id,
            items = []

        //collect order items
        for (var i = 0; i < this.data.goods.length; i++) {
            let el = this.data.goods[i]
            if (el.buy_amount > 0) {
                let item = {
                    user_id: user_id
                }
                item.book_title = el.book.title //书名
                item.type = el.type //类型
                item.isbn = el.isbn //ISBN
                item.book_price = el.selling_price //售价
                item.number = el.buy_amount //购买数量
                item.goods_id = el.id //商品ID
                items.push(item)
            }
        }

        if (items.length > 0) {
            //send request to add shopcart
            wx.request({
                url: 'https://app.cumpusbox.com/v1/orders/AddToShopCart',
                data: {
                    items
                },
                method: 'POST',
                success(res) {
                    console.log(res)
                    if (res.data.code == '00000') {
                        wx.switchTab({
                            url: '/pages/shopCart/shopCart'
                        })
                    }
                }
            })
        }
        console.log(items)
    },

    goodsNumberInputBlur(e) {
        var index = e.currentTarget.dataset.index,
            value = e.detail.value,
            goods = this.data.goods

        var change = value - goods[index].buy_amount,
            goods_price = goods[index].selling_price_yuan

        goods[index].buy_amount = value

        this.setData({
            "goods": goods,
            "total_price": (parseFloat(this.data.total_price) + parseFloat(change * goods_price)).toFixed(2),
            "total_number": this.data.total_number + change
        })
    },
    changeAmount(e) {
        let index = e.currentTarget.dataset.index,
            goods = this.data.goods,
            type = e.currentTarget.dataset.operateType

        var goods_price = 0,
            change = 0

        if (type == 'add') {
            if (goods[index].buy_amount < goods[index].amount) {
                goods[index].buy_amount++
                    goods_price = goods[index].selling_price_yuan
                change = 1
            }
        } else if (type == 'reduce') {
            goods[index].buy_amount--
                change = -1
            goods_price = goods[index].selling_price_yuan
        }

        this.setData({
            "goods": goods,
            total_price: (parseFloat(this.data.total_price) + parseFloat(change * goods_price)).toFixed(2),
            total_number: this.data.total_number + change
        })
    },
    onLoad(option) {
        console.log(option)

        //request goodsId and get this goods detail info
        let app = getApp(),
            data = {
                page: 1,
                size: 10
            }
        data.shop_id = app.shop_id
        data.isbn = option.isbn
        data.min_number = 1

        console.log(data)

        var self = this

        wx.request({
            url: 'https://app.cumpusbox.com/v1/books/listBooks',
            method: "POST",
            data: data,

            success(res) {
                var goods = res.data.data,
                    goods_item = res.data.data[0]
                if (res.data.code == '00000') {
                    //set pre_price
                    self.setData({
                        "pre_price": (goods_item.book.price_int / 100).toFixed(2)
                    })

                    //get shopcart info
                    let user = wx.getStorageSync('user')

                    wx.request({
                        url: 'https://app.cumpusbox.com/v1/orders/GetShopcart',
                        method: "POST",
                        data: {
                            'user_id': user.id
                        },
                        success(res) {

                            var shopcartItems = res.data.items

                            //set newBook_price and oldBook_price
                            var goods_items = goods.map((el) => {

                                //如果该商品已经在购物车内了，更新库存
                                for (var i = 0; i < shopcartItems.length; i++) {
                                    if (shopcartItems[i].goods_id == el.id) {
                                        el.amount -= shopcartItems[i].number
                                        break
                                    }
                                }

                                //set selling_price, and discount
                                el.discount = (el.selling_price / el.book.price_int * 10).toFixed(1)
                                el.selling_price_yuan = (el.selling_price / 100).toFixed(2)

                                //set buy_amount field
                                el.buy_amount = 0
                                return el
                            })

                            self.setData({
                                "goods": goods_items
                            })

                            //设置购物车内商品总价、总数量
                            if (res.data.code == '00000') {
                                self.setData({
                                    "total_number": res.data.total_number,
                                    "total_price": (res.data.total_price / 100).toFixed(2)
                                })
                            }

                            console.log(res)
                        }
                    })

                } else {
                    //met error
                }
            }
        })





    },
    onReady() {
        console.log('-------------------------')

        console.log(this.data.goods.length)

        console.log('-------------------------')
    }
})
