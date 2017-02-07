Page({
  data:{
    shopName:"新华书店",
    goods:[
      {id:"18a36dab-4b80-4f51-9577-60f7ffe76fa2",goods_id:"5d47d4bd-68cc-4bc8-9379-6cc910e59ead",image:"/images/shopCart/book1.png",order_id:"",book_title:"机械制图",book_price:23423,number:1,type:1,isbn:"9787122087935",selected:true},
      {id:"14736c6b-8868-4044-956d-93cf1ca58062",goods_id:"f77e8c78-105e-4dbf-92eb-3092a64c8b25",image:"/images/shopCart/book1.png",order_id:"",book_title:"Linux设备驱动开发详解",book_price:8000,number:2,type:2,isbn:"9787111507895",selected:true},
      {id:"8796ff02-d915-40fb-bd0a-e8dd8c07f3ff",goods_id:"5d47d4bd-68cc-4bc8-9379-6cc910e59ead",image:"/images/shopCart/book1.png",order_id:"",book_title:"机械制图",book_price:23423,number:1,type:1,isbn:"9787122087935",selected:true},
      {id:"7a83c22b-2c65-4f05-a59e-81d729acb38f",goods_id:"f77e8c78-105e-4dbf-92eb-3092a64c8b25",image:"/images/shopCart/book1.png",order_id:"",book_title:"Linux设备驱动开发详解",book_price:8000,number:2,type:2,isbn:"9787111507895",selected:true},
      {id:"7a83c22b-2c65-4f05-a59e-81d729acb38f",goods_id:"f77e8c78-105e-4dbf-92eb-3092a64c8b25",image:"/images/shopCart/book1.png",order_id:"",book_title:"Linux设备驱动开发详解",book_price:8000,number:2,type:2,isbn:"9787111507895",selected:true},
      {id:"7a83c22b-2c65-4f05-a59e-81d729acb38f",goods_id:"f77e8c78-105e-4dbf-92eb-3092a64c8b25",image:"/images/shopCart/book1.png",order_id:"",book_title:"Linux设备驱动开发详解",book_price:8000,number:2,type:2,isbn:"9787111507895",selected:true},
      {id:"7a83c22b-2c65-4f05-a59e-81d729acb38f",goods_id:"f77e8c78-105e-4dbf-92eb-3092a64c8b25",image:"/images/shopCart/book1.png",order_id:"",book_title:"Linux设备驱动开发详解",book_price:8000,number:2,type:2,isbn:"9787111507895",selected:true}
    ],
    total_price:781111.11,
    total_number:6,

    minusStatuses: ['disabled', 'disabled', 'normal', 'normal', 'disabled'],
    selectedAllStatus: false,

    hidden:true,
    nocancel:false,
    temp_index:-1
  },
  onLoad:function(e){
    this.sum()
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
