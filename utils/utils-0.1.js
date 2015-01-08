/**
 * Author: Ying Xiong.
 * Created: Jan 06, 2015.
 */

function assert(condition, message) {
    if (!condition) {
        message = (typeof message !== "undefined") ?
            message : "Assersion failed.";
        throw new Error(message);
    }
}

function randomIntegers(low, high, size) {
    var choices = new Array(high-low);
    for (var i = low; i < high; i++) {
        choices[i-low] = i;
    }
    var result = new Array(size);
    for (var i = 0; i < size; i++) {
        var idx = Math.floor(Math.random() * (choices.length-i));
        result[i] = choices[idx];
        choices[idx] = choices[choices.length - i - 1];
    }
    return result;
}
