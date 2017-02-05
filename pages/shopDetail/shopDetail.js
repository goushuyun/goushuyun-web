Page({
    data:{
        shopImg:"http://ojrfwndal.bkt.clouddn.com/WechatIMG5.jpeg",
        shopName:"新华书店",
        tell:"123456789",
        address:"中国北京",
        description:"1937年4月24日，新华书店在革命圣地延安的清凉山创立[1]。半个世纪来，它在抗日的烽火、解放的硝烟里成长，在新中国成立后发展壮大。五十春秋话新华，十万书林遍神州，螽斯衍庆，欣以为志。"
    },
    callPhone:function(e) {
        wx.makePhoneCall({
            phoneNumber: this.data.tell
        })
  }
})