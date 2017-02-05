Page({
    data: {
        goods: [],

        pre_price: 0,
        newBook_price: 0,
        oldBook_price: 0
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
                console.log(res)

                var goods = res.data.data, goods_item = res.data.data[0]

                console.log(goods_item.book.price_int)


                if(res.data.code == '00000'){
                    //set pre_price
                    self.setData({
                        "pre_price": (goods_item.book.price_int/100).toFixed(2)
                    })

                    //set newBook_price and oldBook_price
                    var goods_items = res.data.data.map((el)=>{
                        //set selling_price, and discount
                        el.discount = (el.selling_price/el.book.price_int*10).toFixed(1)
                        el.selling_price = (el.selling_price/100).toFixed(2)
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
