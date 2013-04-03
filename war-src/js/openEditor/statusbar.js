// if (typeof (plt) === 'undefined') {
//     this.plt = {};
// }
// if (typeof (plt.wescheme) === 'undefined') {
//     this.plt.wescheme = {};
// }


goog.provide('plt.wescheme.WeSchemeStatusBar');


goog.require('plt.wescheme.WeSchemeIntentBus');



var WeSchemeStatusBar;

plt.wescheme.WeSchemeStatusBar = WeSchemeStatusBar = (function() {
    function WeSchemeStatusBar(statusbar) {
	this.statusbar = statusbar;

	this.delay_till_fade = 5000; // five seconds until we fade the text.
	this.fadeCallbackId = undefined;

	var that = this;
	var handleNotifyIntent = function(action, category, data) {
	    var editorNotifyCategoryMap = {
		'before-save': 'Program is being saved',
		'after-save': 'Program has been saved',
		'before-clone': 'Program is being cloned',
		'after-clone': 'Program has been cloned',
		'before-load': 'Program is being loaded',
		'after-load': 'Program has been loaded',
		'before-publish': 'Program is being published',
		'after-publish': 'Program has been published',
		'before-run': 'Program is being executed',
		'after-run': 'Program has been executed',
		'before-share': 'Program is being shared',
		'after-share': 'Program has been shared',
                'before-editor-reload-on-save': 'Please wait; saving program...'
            };
	    if (action === 'notify' && editorNotifyCategoryMap[category]) {
		that.notify(editorNotifyCategoryMap[category]);
	    } else if (action === 'notify' &&
		       category === 'exception') {
		var component = data[0];
		if (component instanceof WeSchemeEditor) {
		    var operation = data[1];
		    var statustext = data[2];
		    var exceptionObj = data[3];
		    that.notify("Exception occured in operation " + operation);
		}
	    }
	};

	plt.wescheme.WeSchemeIntentBus.addNotifyListener(handleNotifyIntent);
    }


    var isBlinking = false;
    WeSchemeStatusBar.prototype.catchAttention = function(){
        if (isBlinking) { return; }
        var index = 0;
        var that = this;
        isBlinking = true;
        var oldBackground = (this.statusbar.parent().css("background") 
                             || "wheat");
        var oldTextcolor = this.statusbar.css("color") || "black";

        var toggle = function() {
            if (++index % 2 == 0) {
                that.statusbar.parent().css("background", "white");
                that.statusbar.css('color', 'black');
            } else {
                that.statusbar.parent().css("background", "black");
                that.statusbar.css('color', 'white');
            }
        }
        toggle();
        var intervalId =
        setInterval(function() {
                toggle();
                if (index > 1) {
                    // reset
                    that.statusbar.parent().css("background", oldBackground);
                    that.statusbar.css("color", oldTextcolor);
                    isBlinking = false;
                    clearInterval(intervalId); 
                }
            }, 1000);
    };


    WeSchemeStatusBar.prototype.notify = function(msg) {
	var that = this;
	
	if (this.fadeCallbackId) {
	    clearTimeout(this.fadeCallbackId);
	    this.fadeCallbackId = undefined;
	}

        if (msg) { this.catchAttention(); }
        
	this.statusbar.text(msg);
	this.statusbar.fadeIn("fast");

	this.fadeCallbackId = setTimeout(
	    function() {
		that.statusbar.fadeOut(
                    "fast", function () { that.statusbar.text(""); });
	    }, 
	    this.delay_till_fade);
	// FIXME: make transparent after a while.
	// FIXME: use flapjax to guarantee that a message shows up for some period of time.
	// FIXME: allow the user to see all the statusbar messages sent to us.
    };


    return WeSchemeStatusBar;
})();
