Page({
  data:{
    shopName:"新华书店",
    goods:[],
    total_price:0,
    total_number:0,

    minusStatuses: ['disabled', 'disabled', 'normal', 'normal', 'disabled'],
    selectedAllStatus: false,

    hidden:true,
    nocancel:false,
    temp_index:-1
  },
  onLoad:function(e){
    var self = this;
    wx.request({
      url: 'https://app.cumpusbox.com/v1/orders/GetShopcart', //仅为示例，并非真实的接口地址
      data: {
         user_id : 'aa9254c9-0a13-45df-8bf1-10a57802b943'
      },
      header: {
          'content-type': 'application/json'
      },
      method: 'POST',
      success: function(res) {
        console.log(res.data)
        let user_id = wx.getStorageSync('user').id, items = []
        for (var i = 0; i < res.data.items.length; i++) {
            let el = res.data.items[i]
            console.log(el)
            if(res.data.total_number > 0){
                let item = {user_id: user_id}
                item.id = el.id
                item.book_image = el.book_image  //图片
                item.book_price = (el.book_price/100).toFixed(2) //售价
                item.book_title = el.book_title  //书名
                item.goods_id = el.goods_id      //商品ID
                item.isbn = el.isbn              //ISBN
                item.number = el.number          //购买数量
                item.type = el.type              //类型
                item.selected = true             //选中
                items.push(item)
            }
        }
        self.setData({
          goods:items
        })
        self.sum()
      }
    })
  },
  chooseCategory(e){
      wx.navigateTo({
          url: '/pages/shopDetail/shopDetail'
      })
  },
  cancel: function(){
    this.setData({
       hidden: true
    });
  },
  confirm: function(e){
    var index = this.data.temp_index;
    // 购物车数据
    var goods = this.data.goods;
    goods.splice(index,1);
    // 将数值与状态写回
    this.setData({
      hidden:true,
      goods: goods
    });
    this.sum()
  },
  bindMinus: function(e) {
    var index = parseInt(e.currentTarget.dataset.index);
    var number = this.data.goods[index].number;
    // 如果只有1件了，就不允许再减了
    if (number > 1) {
      number --;
    }else {
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
    // 自增
    number ++;
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
  deletCart:function(e){
    var index = parseInt(e.currentTarget.dataset.index);
    this.setData({
       hidden: false,
       temp_index:index
    });
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
    if(total_number==goods.length){
      selectedAllStatus=true;
    }
    // 写回经点击修改后的数组
    this.setData({
      goods: goods,
      total_price: total_price.toFixed(2),
      total_number: total_number,
      selectedAllStatus:selectedAllStatus
    });
  }
})
