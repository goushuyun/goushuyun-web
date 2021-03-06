var app = getApp()
Page({
     data: {
         shopName: '',
         goods: [], //购物车所有商品
         temp_goods: [], //购物车副本
         total_price: 0, //购物车总价
         total_number: 0, //购物车商品种类数

         minusStatuses: ['disabled', 'disabled', 'normal', 'normal', 'disabled'], //加减状态
         selectedAllStatus: false, //全选状态

         store_infos: [],

         store_infos_show: false
     },
     checkMaxAmount(e) {
         var input = e.detail.value
         let index = e.currentTarget.dataset.index
         let amount = this.data.goods[index].store_number
         if (input > amount) {
             wx.showModal({
                 content: '亲~当前库存仅剩' + amount + '本！',
                 showCancel: false
             })
             this.data.goods[index].number = amount
             this.sum()
             return amount
         }
     },
     onShow: function(e) {
         this.showGoods(e)
     },
     goBuyPage(e) {
         let isbn = e.currentTarget.dataset.isbn
         console.log(isbn);
         //跳转到 buyPage
         wx.navigateTo({
             url: "/pages/buyPage/buyPage?isbn=" + isbn
         })
     },
     showGoods(e) {
         var self = this;
         var user_id = wx.getStorageSync('user').id
         console.log('-----------------------');
         console.log(user_id);
         wx.request({
             url: app.url + '/v1/orders/GetShopcart',
             data: {
                 user_id: user_id
             },
             method: 'POST',
             success: function(res) {
                 var items = []
                 var store_infos = []
                 for (var i = 0; i < res.data.items.length; i++) {
                     let el = res.data.items[i]
                     if (res.data.total_number >= 0) {
                         let item = {
                             user_id: user_id
                         }
                         item.id = el.id
                         item.book_image = el.book_image //图片
                         item.book_price = (el.book_price / 100).toFixed(2) //售价
                         item.book_title = el.book_title //书名
                         item.goods_id = el.goods_id //商品ID
                         item.isbn = el.isbn //ISBN

                         item.store_number = el.store_number //库存数量
                         item.type = el.type //类型

                         /* 当库存为为0 或者不足 时 不可售 */
                         item.can_sale = el.number <= el.store_number ? true : false //库存是否充足
                         item.store_empty = el.store_number < 1 ? true : false //库存是否为空
                         item.pre_number = el.number //原购买数量
                         item.number = item.can_sale ? el.number : 0 //购买数量
                         item.selected = (item.number != 0) ? true : false //选中

                         if (item.store_empty) {
                             var store_info = (store_infos.length + 1) + '.' + item.book_title + '(' + (item.type == 1 ? '新书' : '二手书') + ')' + '已售完'
                             store_infos.push(store_info)
                         } else if (!item.can_sale) {
                             var store_info = (store_infos.length + 1) + '.' + item.book_title + '(' + (item.type == 1 ? '新书' : '二手书') + ')' + '库存不足' + item.pre_number + '件，请重新选择'
                             store_infos.push(store_info)
                         }
                         items.push(item)
                     }
                 }
                 self.setData({
                     goods: items,
                     temp_goods: items,
                     store_infos: store_infos,
                     store_infos_show: store_infos.length > 0 ? true : false
                 })
                 self.sum()
             },
             fail: function(res) {
                 console.log(res)
             }
         })
     },
     onHide: function(e) {
         this.updateGoods(e)
     },
     onUnload: function(e) {
         this.updateGoods(e)
     },
     updateGoods: function(e) {
         var items = []
         for (var i = 0; i < this.data.goods.length; i++) {
             var good = this.data.goods[i]
             var temp_good = this.data.temp_goods[i]
             if (good.number != temp_good.number || !good.can_sale) {
                 var item = {
                     id: good.id,
                     number: good.number
                 }
                 items.push(item)
             }
         }
         if (items.length == 0) {
             return
         }
         wx.request({
             url: app.url + '/v1/orders/UpdateOrderItems',
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
         var goodSelected = this.data.goods[index].selected
         // 如果只有1件了，就不允许再减了
         if (number > 0) {
             number--;
         } else {
             this.deletCart(e)
         }
         // 只有大于一件的时候，才能normal状态，否则disable状态
         var minusStatus = number <= 0 ? 'disabled' : 'normal';
         // 购物车数据
         var goods = this.data.goods;
         goods[index].number = number;
         //当前good数量为0 取消选中
         if (number == 0) {
             goods[index].selected = false
         }
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
         if (number < storeNumber) {
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
                 content: '亲~当前库存仅剩' + storeNumber + '本！',
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
             if (goods[i].number != 0 && !goods[i].store_empty) {
                 goods[i].selected = selectedAllStatus;
             }
         }
         this.setData({
             selectedAllStatus: selectedAllStatus,
             goods: goods
         });
         this.sum()
     },
     settlement: function() {
         var goods_length = this.data.goods.length

         /* 如果购物车没有商品 */
         if (goods_length <= 0) {
             wx.showModal({
                 content: '亲！您尚未添加任何宝贝！',
                 showCancel: false
             })
             return
         }

         /* 如果没勾选任何商品 */
         var selected_length = this.data.total_number
         if (selected_length <= 0) {
             wx.showModal({
                 content: '亲！您尚选中选任何宝贝！',
                 showCancel: false
             })
             return
         }

         /* 准备数据，并调转至结算页面 */
         var items = []
         var checkItems = []
         for (var i = 0; i < goods_length; i++) {
             var item = this.data.goods[i]
             var checkItem = {}
             if (item.selected) {
                 items.push(item)
                 checkItem.goods_id = item.goods_id
                 checkItem.number = item.number
                 checkItems.push(checkItem)
             }
         }

         var shopCartData = {
             items: items,
             total_price: this.data.total_price
         }

         var checkData = {
             items: checkItems,
             shop_id: wx.getStorageSync('shop').id
         }

         var self = this
         /* 下单检查 */
         wx.request({
             url: app.url + '/v1/orders/CheckShopcartNumber',
             data: checkData,
             method: 'POST',
             success: function(res) {
                 if (res.data.can_place_order) {
                     wx.setStorage({
                         key: "shopCartData",
                         data: shopCartData
                     })
                     wx.navigateTo({
                         url: '/pages/settlement/settlement'
                     })
                 } else {
                     self.showGoods()
                 }
             }
         })
     },
     deletCart: function(e) {
         var index = parseInt(e.currentTarget.dataset.index);
         var self = this;
         wx.showModal({
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
             url: app.url + '/v1/orders/DeleteOrderItem',
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
                         icon: 'success',
                         duration: 500
                     })
                 } else {
                     wx.showToast({
                         title: '删除失败',
                         icon: 'loading',
                         duration: 500
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
         var total_price = 0
         var total_number = 0
         var selectedAllStatus = false
         var cannotSelect_number = 0
         for (var i = 0; i < goods.length; i++) {
             if (goods[i].selected) {
                 total_price += goods[i].number * goods[i].book_price
                 total_number += 1
             }
             if (goods[i].store_empty || goods[i].number == 0) {
                 cannotSelect_number += 1
             }
         }
         if ((total_number + cannotSelect_number) == goods.length) {
             selectedAllStatus = true;
         }
         // 写回经点击修改后的数组
         this.setData({
             goods: goods,
             total_price: total_price.toFixed(2),
             total_number: total_number,
             selectedAllStatus: selectedAllStatus
         });
     },
     //关闭弹框
     unShow: function() {
         this.setData({
             store_infos_show: false
         })
     },
     onShareAppMessage(e) {
       return {
            title: app.shareTitle,
            path: '/pages/index/index'
        }
     }
 })
