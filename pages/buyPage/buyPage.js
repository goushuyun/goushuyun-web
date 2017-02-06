Page({
    data: {
        goods: [],
        pre_price: 0,
        newBook_price: 0,
        oldBook_price: 0
    },
    addToShopCart(){
        let user_id = wx.getStorageSync('user').id, items = []

        //collect order items
        for (var i = 0; i < this.data.goods.length; i++) {
            let el = this.data.goods[i]
            if(el.buy_amount > 0){
                let item = {user_id: user_id}
                item.book_title = el.book.title
                item.book_price = el.selling_price
                item.number = el.buy_amount
                item.goods_id = el.id
                items.push(item)
            }
        }

        if(items.length > 0){
            //send request to add shopcart
            wx.request({
                url: 'https://app.cumpusbox.com/v1/orders/AddToShopCart',
                data: {items},
                method: 'POST',
                success(res){
                    console.log(res)
                    if(res.data.code == '00000'){

                    }
                }
            })
        }
        console.log(items)

    },
    onUnload(){
        this.addToShopCart()
    },
    onHide(){
        this.addToShopCart()
    },
    goToShopCart(){
        wx.navigateTo({
            url: '/pages/shopDetail/shopDetail'
        })
    },

    goodsNumberInputBlur(e){
        var index = e.currentTarget.dataset.index, value = e.detail.value, goods = this.data.goods

        goods[index].buy_amount = value

        this.setData({
            "goods": goods
        })
    },
    changeAmount(e){
        let index = e.currentTarget.dataset.index, goods = this.data.goods, type = e.currentTarget.dataset.operateType

        if(type == 'add'){
            if(goods[index].buy_amount < goods[index].amount){
                goods[index].buy_amount++
            }
        }else if(type == 'reduce'){
            goods[index].buy_amount--
        }

        this.setData({
            "goods": goods
        })
    },
    onLoad(option){
        console.log(option)

        //request goodsId and get this goods detail info
        let app= getApp(), data = {page: 1, size: 10}
        data.shop_id = app.shop_id
        data.isbn = option.isbn

        console.log(data)

        var self = this

        wx.request({
            url: 'https://app.cumpusbox.com/v1/books/listBooks',
            method: "POST",
            data: data,

            success(res){
                var goods = res.data.data, goods_item = res.data.data[0]
                if(res.data.code == '00000'){
                    //set pre_price
                    self.setData({
                        "pre_price": (goods_item.book.price_int/100).toFixed(2)
                    })

                    //set newBook_price and oldBook_price
                    var goods_items = res.data.data.map((el)=>{
                        //set selling_price, and discount
                        el.discount = (el.selling_price/el.book.price_int*10).toFixed(1)
                        el.selling_price_yuan = (el.selling_price/100).toFixed(2)

                        //set buy_amount field
                        el.buy_amount = 0
                        return el
                    })


                    self.setData({
                        "goods": goods_items
                    })

                }else{
                    //met error
                }
            }
        })
    },
    onReady(){
        console.log('-------------------------')

        console.log(this.data.goods.length)

        console.log('-------------------------')
    }
})
