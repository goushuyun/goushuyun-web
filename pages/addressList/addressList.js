Page({
    data:{
      addresses:[
        {user_name:"冯忠森",tel:"18818000305",address:"上海应用技术大学",selected:true},
        {user_name:"冯忠森",tel:"18818000305",address:"北京市门头沟区军装镇门头沟小学向前100米",selected:false},
        {user_name:"冯忠森",tel:"18818000305",address:"上海市徐汇区漕溪北路595号上海电影广场B座15楼趣医网",selected:false}
      ]
    },
    bindCheckbox: function(e) {
      var index = parseInt(e.currentTarget.dataset.index)
      var addresses = this.data.addresses
      if (!addresses[index].selected){
        for (var i = 0;i<addresses.length;i++) {
          addresses[i].selected = false
        }
        addresses[index].selected = true
      }
      this.setData({
        addresses: addresses
      });
    },
})
