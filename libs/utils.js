function unixTimestamp2DateStr(unixTimestamp) {

    var date = new Date(unixTimestamp * 1000);

    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();

    var year = date.getFullYear()

    var month = ('0' + (date.getMonth() +1 )).substr(-2)
    var day = date.getDate()

    var formattedTime = year + '-' + month +'-' + day + ' ' + hours + ':' + minutes.substr(-2)

    return formattedTime
}


module.exports.unixTimestamp2DateStr = unixTimestamp2DateStr
