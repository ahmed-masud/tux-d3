d3.transition.prototype.end = function(callback, delay) {
    var transition = this;
    if (!transition.size() && (delay || delay === 0)) { // if empty
            d3.timer(function() {
                callback(transition);
                return true;
            }, typeof(delay) === "number" ? delay : 0);
    }
    else {                                            // else Mike Bostock's routine
        var n = 0;
        transition.each(function() { ++n; })
            .each("end", function() {
                if (!(--n)) {
                    callback(transition);
                    return true;
                }
            });
    }
    return transition;
}
