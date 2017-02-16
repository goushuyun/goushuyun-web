function unixTimestamp2DateStr(unixTimestamp) {

    console.log('---------------------------')

    console.log(unixTimestamp)

    console.log('---------------------------')

    var date = new Date(unixTimestamp * 1000);

    console.log(date)

    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();

    var year = date.getFullYear()

    var month = ('0' + (date.getMonth() +1 )).substr(-2)
    var day = date.getDate()

    // Will display time in 10:30:23 format
    var formattedTime = year + '-' + month +'-' + day + ' ' + hours + ':' + minutes.substr(-2)


    console.log(formattedTime)

    return formattedTime
}


module.exports.unixTimestamp2DateStr = unixTimestamp2DateStr
