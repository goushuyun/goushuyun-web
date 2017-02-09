Page({
    data: {
        shopName: "新华书店",
        goods: [], //购物车所有商品
        temp_goods: [], //购物车副本
        total_price: 0, //购物车总价
        total_number: 0, //购物车商品种类数

        minusStatuses: ['disabled', 'disabled', 'normal', 'normal', 'disabled'], //加减状态
        selectedAllStatus: false //全选状态
    },
    onShow: function(e) {
        this.showGoods()
    },
    showGoods: function(e) {
        var self = this;
        wx.request({
            url: 'https://app.cumpusbox.com/v1/orders/GetShopcart',
            data: {
                user_id: 'aa9254c9-0a13-45df-8bf1-10a57802b943'
            },
            header: {
                'content-type': 'application/json'
            },
            method: 'POST',
            success: function(res) {
                let user_id = wx.getStorageSync('user').id,
                    items = []
                for (var i = 0; i < res.data.items.length; i++) {
                    let el = res.data.items[i]
                    if (res.data.total_number > 0) {
                        let item = {
                            user_id: user_id
                        }
                        item.id = el.id
                        item.book_image = el.book_image //图片
                        item.book_price = (el.book_price / 100).toFixed(2) //售价
                        item.book_title = el.book_title //书名
                        item.goods_id = el.goods_id //商品ID
                        item.isbn = el.isbn //ISBN
                        item.number = el.number //购买数量
                        item.store_number = el.store_number //库存数量
                        item.type = el.type //类型
                        item.selected = true //选中
                        items.push(item)
                    }
                }
                self.setData({
                    goods: items,
                    temp_goods: items
                })
                self.sum()
            },
            fail: function(res) {
                console.log(res)
            }
        })
    },
    onHide: function(e) {
        this.updateGoods()
    },
    onUnload: function(e) {
        this.updateGoods()
    },
    updateGoods: function(e) {
        var items = []
        for (var i = 0; i < this.data.goods.length; i++) {
            var good = this.data.goods[i]
            var temp_good = this.data.temp_goods[i]
            if (good.number != temp_good.number) {
                var item = {
                    id: good.id
                }
                item.number = good.number
                items.push(item)
            }
        }
        wx.request({
            url: 'https://app.cumpusbox.com/v1/orders/UpdateOrderItems',
            data: {
                items: items
            },
            header: {
                'content-type': 'application/json'
            },
            method: 'POST',
            fail: function(res) {
                console.log(res)
            }
        })
    },
    chooseCategory(e) {
        wx.navigateTo({
            url: '/pages/shopDetail/shopDetail'
        })
    },
    bindMinus: function(e) {
        var index = parseInt(e.currentTarget.dataset.index);
        var number = this.data.goods[index].number;
        // 如果只有1件了，就不允许再减了
        if (number > 1) {
            number--;
        } else {
            this.deletCart(e)
        }
        // 只有大于一件的时候，才能normal状态，否则disable状态
        var minusStatus = number <= 1 ? 'disabled' : 'normal';
        // 购物车数据
        var goods = this.data.goods;
        goods[index].number = number;
        // 按钮可用状态
        var minusStatuses = this.data.minusStatuses;
        minusStatuses[index] = minusStatus;
        // 将数值与状态写回
        this.setData({
            goods: goods,
            minusStatuses: minusStatuses
        });
        this.sum()
    },
    bindPlus: function(e) {
        var index = parseInt(e.currentTarget.dataset.index);
        var number = this.data.goods[index].number;
        var storeNumber = this.data.goods[index].store_number;
        if (number <= storeNumber) {
            // 自增
            number++;
            // 只有大于一件的时候，才能normal状态，否则disable状态
            var minusStatus = number <= 1 ? 'disabled' : 'normal';
            // 购物车数据
            var goods = this.data.goods;
            goods[index].number = number;
            // 按钮可用状态
            var minusStatuses = this.data.minusStatuses;
            minusStatuses[index] = minusStatus;
            // 将数值与状态写回
            this.setData({
                goods: goods,
                minusStatuses: minusStatuses
            });
            this.sum()

        } else {
            wx.showModal({
                title: '提示',
                content: '已达到库存上限！',
                showCancel: false
            })
        }
    },
    bindCheckbox: function(e) {
        /*绑定点击事件，将checkbox样式改变为选中与非选中*/
        //拿到下标值，以在goods作遍历指示用
        var index = parseInt(e.currentTarget.dataset.index);
        //原始的icon状态
        var selected = this.data.goods[index].selected;
        var goods = this.data.goods;
        // 对勾选状态取反
        goods[index].selected = !selected;
        // 写回经点击修改后的数组
        this.setData({
            goods: goods
        });
        this.sum()
    },
    bindSelectAll: function() {
        // 环境中目前已选状态
        var selectedAllStatus = this.data.selectedAllStatus;
        // 取反操作
        selectedAllStatus = !selectedAllStatus;
        // 购物车数据，关键是处理selected值
        var goods = this.data.goods;
        // 遍历
        for (var i = 0; i < goods.length; i++) {
            goods[i].selected = selectedAllStatus;
        }
        this.setData({
            selectedAllStatus: selectedAllStatus,
            goods: goods
        });
        this.sum()
    },
    bindCheckout: function() {
        // 初始化toastStr字符串
        var toastStr = 'id:';
        // 遍历取出已勾选的cid
        for (var i = 0; i < this.data.goods.length; i++) {
            if (this.data.goods[i].selected) {
                toastStr += this.data.goods[i].id;
                toastStr += ' ';
            }
        }
        //存回data
        this.setData({
            toastHidden: false,
            toastStr: toastStr
        });
    },
    deletCart: function(e) {
        var index = parseInt(e.currentTarget.dataset.index);
        var self = this;
        wx.showModal({
          title: '提示',
          content: '亲，确定要删除这个宝贝吗？',
          cancelText: '不不不！',
          confirmText: '删了它！',
          success: function(res) {
            if (res.confirm) {
                var index = parseInt(e.currentTarget.dataset.index);
                self.deletConfirm(index)
            }
          }
        })
    },
    deletConfirm: function(index) { //Model确定
        var self = this;
        // 购物车数据
        var goods = self.data.goods
        var temp_goods = self.data.temp_goods
        wx.request({
            url: 'https://app.cumpusbox.com/v1/orders/DeleteOrderItem',
            data: {
                id: goods[index].id
            },
            header: {
                'content-type': 'application/json'
            },
            method: 'POST',
            success: function(res) {
                if (res.data.code == "00000") {
                    goods.splice(index, 1)
                    temp_goods.splice(index, 1) //保证副本中商品项一致
                    // 将数值与状态写回
                    self.setData({
                        goods: goods
                    });
                    self.sum()
                    wx.showToast({
                        title: '删除成功',
                        icon: 'success'
                    })
                } else {
                    wx.showToast({
                        title: '删除失败',
                        icon: 'loading'
                    })
                }
            },
            fail: function(res) {
                console.log(res)
            }
        })
    },
    sum: function() {
        var goods = this.data.goods;
        // 计算总金额
        var total_price = 0;
        var total_number = 0;
        var selectedAllStatus = false;
        for (var i = 0; i < goods.length; i++) {
            if (goods[i].selected) {
                total_price += goods[i].number * goods[i].book_price;
                total_number += 1;
            }
        }
        if (total_number == goods.length) {
            selectedAllStatus = true;
        }
        // 写回经点击修改后的数组
        this.setData({
            goods: goods,
            total_price: total_price.toFixed(2),
            total_number: total_number,
            selectedAllStatus: selectedAllStatus
        });
    }
})
