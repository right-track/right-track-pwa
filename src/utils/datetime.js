/**
 * Convert the number of minutes into h hours m minutes string
 * @param mins number of minutes
 * @param [short] set hours to h and minutes to m
 * @returns {string}
 */
function minutesToString(mins, short) {
    let h = Math.floor(mins/60);
    let m = Math.floor(mins%60);
    let s = "";

    // Set Hours
    if ( h === 1 ) {
        s += h + " hour";
    }
    else if ( h > 1 ) {
        s += h + " hours";
    }

    // Set Spacer
    if ( m > 0 && h > 0 ) {
        s += " ";
    }

    // Set Minutes
    if ( h === 0 && m === 0 ) {
        s += "0 minutes";
    }
    else if ( m === 1 ) {
        s += m + " minute";
    }
    else if ( m > 1 ) {
        s += m + " minutes";
    }

    // Shorten
    if ( short ) {
        s = s.replace(" minutes", "m");
        s = s.replace(" minute", "m");
        s = s.replace(" hours", "h");
        s = s.replace(" hour", "h");
    }

    return s;
}


function HHmmssToTime(input) {
    
    // Split into hours and minutes
    let parts = input.split(":");
    let h = parseInt(parts[0]);
    let m = parts[1];
    
    // Final components
    let hr = "";
    let mi = "";
    let ap = "";

    // Parse Hour
    if ( h === 0 ) {
        hr = "12";
        mi = m;
        ap = "AM";
    }
    else if ( h < 12 ) {
        hr = h;
        mi = m;
        ap = "AM";
    }
    else if ( h === 12 ) {
        hr = h;
        mi = m;
        ap = "PM";
    }
    else if ( h < 24 ) {
        hr = h - 12;
        mi = m;
        ap = "PM";
    }
    else if ( h === 24 ) {
        hr = "12";
        mi = m;
        ap = "AM";
    }
    else if ( h > 24 ) {
        hr = h - 24;
        mi = m;
        ap = "AM";
    }

    return hr + ":" + mi + " " + ap;
}


module.exports = {
    minutesToString: minutesToString,
    HHmmssToTime: HHmmssToTime
}