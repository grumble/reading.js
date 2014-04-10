// copyright (c) 2012--2014 Alex Dunn
(function() {
    "use strict";

    // three CSS themes we can switch between
    var themes = ["high", "light", "dark"];

    // just a list to reference when dealing with header elements;
    // in all caps because I guess javascript likes that?
    var headerList = [ "H1", "H2", "H3", "H4", "H5", "H6" ];
    // these are excluded from the array of elements that can be made
    // active (by scrolling with j/k and other keys):
    var scrollSkip = [ "HEADER", "HR" ];

    // this array will be populated with document.body.children
    var elements = [];
    var bear;

    // keyCode/charCode variables
    var keyNext = 106;
    var keyPrev = 107;
    var keyNextUp = 111;
    var keyPrevUp = 105;
    var keyFirst = 117;
    var keyLast = 109;
    var keyAll = 97;
    var keyExpand = 102;
    var keyTheme = 115;

    // this gets set to the window.location (minus `#id`) in the
    // `window.load` function and is also used in the `makeActive`
    // function (we add the `#id` to it):
    var url;

    ///////////
    // SETUP //
    ///////////

    addListener(window, "load", function() {
        // do this stuff when the `window.load` event fires:

        // unicode symbols for button icons
        var iconThis = "←";
        var iconAll = "↕";

        var headerLinks = " <button class='this' title='Collapse this section'>" + iconThis + "</button> <button class='all' title='Collapse all sections at this level'>" + iconAll + "</button>";

        // default to the first theme
        document.documentElement.classList.add(themes[0]);

        // populate the elements array (without the infobox):
        elements = document.body.children;

        // build a bear
        bear = buildABear();

        // append some cute buttons:
        var pointer = bear.numberOfElements - 1;
        // var bearPoint = bear[pointer];
        while ( pointer ) {
            if ( isHeaderTag(bear[pointer].tag) ) {
                elements[pointer].innerHTML += headerLinks;
                // and add an event listener:
                addListener(elements[pointer], "click", toggleHandler);
            }
            pointer--;
            // bear[pointer] = bear[pointer];
        }

        // make the first header active, but don't scroll to it:
        pointer = 0;
        // bear[pointer] = bear[pointer];
        while ( (pointer < bear.numberOfElements) && (bear[pointer].tag !== ("H1" || "H2" || "H3" || "H4" || "H5" || "H6") ) ) {
            pointer++;
            // bear[pointer] = bear[pointer];
        }
        elements[pointer].classList.add("active");

        // make the first header the target of the "skip to content link"
        // in the infobox.  if it doesn't already have an id, give it one:
        var firstHId = elements[pointer].getAttribute("id");
        var startId;
        if ( firstHId === null ) {
            elements[pointer].setAttribute("id", "startOfContent");
            startId = "startOfContent";
        }
        else {
            startId = firstHId;
        }

        // If the page loads with an #id that points to a header, scroll
        // to that header when the page loads:
        url = window.location.toString();
        // check if the url has an #id suffix:
        var urlPound = url.indexOf("#");
        if ( urlPound !== -1 ) {
            var urlId = url.slice(urlPound + 1);
            // after getting the id, remove it from the global url var:
            url = url.slice(0, urlPound);
            // find the element with the id from the url
            var startAt = document.getElementById(urlId);
            // if it's a header, make it active upon loading,
            // but check if getElementById worked also:
            if ( startAt && isHeaderTag(startAt.tagName) ) {
                makeActive(startAt);
            }
        }

        // now add the infobox at the top:

        var helpBoxText = "<p><a href=\"#" + startId + "\" title=\"Skip to content\">Skip to content</a></p><aside><h3>Keyboard shortcuts</h3><ul><li><span class=\"key\">" + String.fromCharCode(keyNext) + " / " + String.fromCharCode(keyPrev) + "</span> next/previous</li><li><span class=\"key\">enter</span> toggle active header</li><li><span class=\"key\">" + String.fromCharCode(keyNextUp) + " / " + String.fromCharCode(keyPrevUp) + "</span> next/previous header (one level up)</li><li><span class=\"key\">" + String.fromCharCode(keyFirst) + " / " + String.fromCharCode(keyLast) + "</span> start/end of document</li><li><span class=\"key\">" + String.fromCharCode(keyAll) + "</span> toggle everything in this section</li><li><span class=\"key\">" + String.fromCharCode(keyExpand) + "</span> expand everything (do this before you search)</li><li><span class=\"key\">" + String.fromCharCode(keyTheme) + "</span> change theme</li></ul></aside>";

        // find the first element after <body>:
        var firstElement = document.body.children[0];
        // then make a new div
        var helpDiv = document.createElement("div");
        // and give it a class (if you change the class name, make sure to
        // change it in the `getElements` definition and in
        // _screen.scss)
        helpDiv.classList.add("js-infobox");
        // and shove it into the top of the page
        document.body.insertBefore(helpDiv, firstElement);
        // and give it some content:
        helpDiv.innerHTML=helpBoxText;

        // repopulate the elements array
        elements = document.body.children;

        // rebuild the bear
        bear = buildABear();

        // end window.load event listener
    });

    //////////////
    // KEYPRESS //
    //////////////

    addListener(window, "keypress", function(key) {
        // do this stuff when a key is pressed:

        // http://stackoverflow.com/a/5420482
        key = key || window.event;
        var theKey = key.which || key.keyCode;

        switch (theKey) {
            // if they hit return/enter, toggle the active section:
        case 13 :
            toggleHandler( whoIsActive() );
            break;
            // if they press "a", collapse all headers at the same level
            // as the active header:
        case keyAll :
            var active = whoIsActive();
            if ( isHeaderTag(active.tagName) ) {
                toggleHandler(document.getElementsByTagName(active.tagName));
            }
            break;
            // if they pressed 'j' then move down one:
        case keyNext :
            makeActive(elemRelativeToActive(visible, true, 1));
            break;
            // if they press 'k' go up:
        case keyPrev :
            makeActive(elemRelativeToActive(visible, false, 1));
            break;
            // if they press "u", go to the first visible element:
        case keyFirst :
            makeActive(visible[0]);
            break;
            // if they press "m" go to the last visible element:
        case keyLast :
            makeActive(visible[visible.length - 1]);
            break;
            // if they press "i", go to the previous header that's a level up:
        case keyPrevUp :
            makeActive(headerOneLevelUp(false));
            break;
            // if they press "o" go to the next header that's a level up:
        case keyNextUp :
            makeActive(headerOneLevelUp(true));
            break;
            // if they press "f", expand everything
            // (this is a useful feature I guess, but it also has to be
            // activated before the user tries to search; hence being bound to
            // "f".  This is more a work-around than an actual solution,
            // obvs):
        case keyExpand :
            while ( isAnythingHidden(visible) ) {
                for ( var f = 0; f < visible.length; f++ ) {
                    if ( visible[f].classList.contains("collapsed") ) {
                        toggleHandler(visible[f]);
                    }
                }
            }
            break;
            // press "s" to change the theme
        case keyTheme :
            var html = document.documentElement.classList;
            for ( var i = 0; i < themes.length; i++ ) {
                // if we've reached the active theme,
                if ( html.contains(themes[i]) ) {
                    // then turn it off,
                    html.toggle(themes[i]);
                    // if we're NOT at the penultimate theme,
                    if ( i < themes.length - 1 ) {
                        // then turn on the next theme
                        html.toggle(themes[i + 1]);
                        break;
                    }
                    // if we ARE at the penultimate theme, then start over
                    else {
                        html.toggle(themes[0]);
                    }
                }
            }
            break;
        }
        // end window.keypress event listener
    });

    ////////////////////////
    // TOGGLING FUNCTIONS //
    ////////////////////////

    // toggleHandler checks what's being toggled, and in turn calls
    // toggleMe or toggleSame:
    function toggleHandler(event) {
        console.log("toggleHandler commencing");
        var handlerStart = new Date();

        var toggleTarget;

        // if toggleHandler was called by a keypress, then whatever
        // function that called toggleHandler has already passed the
        // correct element(s) to the function, so we don't need to do
        // much:

        if ( ! isClick(event) ) {
            toggleTarget = event;
        }

        // if something was clicked, we need to figure out what:
        else {
            clearActive();
            // if it was the header that was clicked, just return that
            // element:
            if ( isHeaderTag(event.target.tagName) ) {
                toggleTarget = event.target;
                event.target.classList.add("active");
            }
            // otherwise, see if it it was the "all" button:
            else if ( event.target.classList.contains("all") ) {
                // if so, return an array of all the headers at that
                // level:
                toggleTarget = document.getElementsByTagName(event.target.parentElement.tagName);
                event.target.parentElement.classList.add("active");
            }
            else {
                // if it was something else clicked (the "this" button),
                // then just return the header parent:
                toggleTarget = event.target.parentElement;
                toggleTarget.classList.add("active");
            }
        }

        // is it just one header, or an array?  If it's not an array it
        // won't have a defined length:
        if ( toggleTarget.length === undefined && isHeaderTag(toggleTarget.tagName) ) {
            toggleMe(toggleTarget);
        }
        else {
            toggleSame();
        }

        // make sure we're scrolled to the active element:
        var theActive = whoIsActive();
        makeActive(theActive);

        // recount elements
        elements = document.body.children;
        // rebuild the bear
        bear = buildABear();

        // end toggleHandler definition

        var handlerEnd = new Date();
        console.log("toggleHandler ending");
        console.log("toggleHandler time: " + (handlerEnd - handlerStart));
    }

    function toggleMe(who) {
        console.log("toggleMe commencing");
        var meStart = new Date();

        var elementIndex = elemNumber(who, bear.numberOfElements);

        // get the number of the header (h1 => 1, h2 => 2, etc)
        var headerNum = bear[elementIndex].tag.slice(1);

        // this variable holds the next header of greater or equal
        // value; it's used to determine how much stuff gets
        // expanded or collapsed
        var stop = compareHeaders(elementIndex, headerNum);

        ///////////////////////////////////////////
        // IF THE HEADER IS COLLAPSED, WE EXPAND //
        ///////////////////////////////////////////
        console.log(bear[elementIndex].classes);
        if ( isOneOf("collapsed", bear[elementIndex].classes) ) {
            console.log("BORBORBORBORR");
            toggleCollapse(who);
            // starting a new counter to go through the elements
            // array and figure out what needs to be unhidden and
            // what headers need to lose the "collapsed" class:
            var r = elementIndex + 1;
            while ( r !== stop && r < bear.numberOfElements ) {
                // if the first element we come across is not a
                // header element, then unhide it and increment
                // the new counter:
                if ( !isHeaderTag(bear[r].tag) ) {
                    elements[r].classList.remove("hidden");
                    r++;
                }
                else {
                    // if the element IS a header, then, if it
                    // DOESN'T have the "collapsed" class, unhide
                    // it and increment the counter:
                    if ( !isOneOf("collapsed", bear[r].classes) ) {
                        elements[r].classList.remove("hidden");
                        r++;
                    }
                    // if the header IS "collapsed", then unhide
                    // it BUT skip everything past it (until we
                    // get to another header):
                    else {
                        var rTagNum = bear[r].tag.slice(1);
                        var rStop = compareHeaders(r, rTagNum);
                        elements[r].classList.remove("hidden");
                        while ( r !== rStop && r < bear.numberOfElements ) {
                            r++;
                        }
                    }
                }
            }
        }
        ////////////////////////////////////////////////////////
        // IF THE ACTIVE HEADER IS NOT COLLAPSED, COLLAPSE IT //
        // AND ITS "CHILDREN":                                //
        ////////////////////////////////////////////////////////
        else {
            console.log("target header is:");
            console.log(who);
            toggleCollapse(who);
            var h = elementIndex + 1;
            while ( h !== stop && h < bear.numberOfElements ) {
                elements[h].classList.add("hidden");
                h++;
            }
        }
        // end `toggleMe` definition
        var meEnd = new Date();
        console.log("toggleMe ending");
        console.log("toggleMe() time: " + (meEnd - meStart));
    }

    function toggleSame() {
        console.log("toggleSame commencing");
        var sameStart = new Date();

        // toggle all headers of the same level as the active:
        var active = whoIsActive();

        var activeIndex = elemNumber(active, bear.numberOfElements);
        var activeHeaderName = bear[activeIndex].tag;
        var activeIsCollapsed = isOneOf("collapsed", bear[activeIndex].classes);

        toggleMe(active);
        var activeNum = activeHeaderName.slice(1);

        var b = activeIndex;

        // first walk up, toggling all at the same level
        var c = b - 1;
        while ( c &&
                (!isHeaderTag(bear[c].tag) ||
                 (bear[c].tag.slice(1) >= activeNum)) ) {
            console.log('(going up) tag: ' + bear[c].tag);
            var curNum = bear[c].tag.slice(1);
            if ( isHeaderTag(bear[c].tag) ) {
                if ( !activeIsCollapsed &&
                     !isOneOf("collapsed", bear[c].classes) &&
                     curNum === activeNum ) {
                         toggleMe(elements[c]);
                     }
                else if ( isOneOf("collapsed", bear[c].classes) &&
                          curNum === activeNum ) {
                              toggleMe(elements[c]);
                          }
            }
            c--;
        }
        // now walk down, toggling all at the same level
        var d = b + 1;
        while ( bear[d] &&
                (!isHeaderTag(bear[d].tag) ||
                 (bear[d].tag.slice(1) >= activeNum)) ) {
            console.log('(going down) tag: ' + bear[d].tag);
            var curNum2 = bear[d].tag.slice(1);
            if ( isHeaderTag(bear[d].tag) ) {
                if ( !activeIsCollapsed &&
                     !isOneOf("collapsed", bear[d].classes) &&
                     curNum2 === activeNum ) {
                         toggleMe(elements[d]);
                     }
                else if (isOneOf("collapsed", bear[d].classes) &&
                         curNum2 === activeNum ) {
                             toggleMe(elements[d]);
                         }
            }
            d++;
        }
        // end `toggleSame` definition
        var sameEnd = new Date();
        console.log("toggleSame ending");
        console.log("toggleSame time: " + (sameEnd - sameStart));
    }

    ////////////////////
    // TOGGLE SUPPORT //
    ////////////////////

    // this function finds the active header, then returns the next header
    // that's at the same level or higher (i.e., if the active header is
    // h3, it will return the next h3, h2, or h1---whichever comes first):
    function compareHeaders(start, headerNum) {
        var compStart = new Date();
        var compEnd;

//        console.log(start + " -> " + headerNum);
        while ( start++ < bear.numberOfElements ) {
            // look at each header after the targetHeader; stop and return
            // that header if it's the same size or bigger than the
            // targetHeader.  Using '<' not '>' because smaller is bigger
            // (h1 < h6):
            if ( bear[start] &&
                 isHeaderTag(bear[start].tag) &&
                 (bear[start].tag.slice(1) <= headerNum) ) {
                // return the match number
                return start;
            }
        }
        // if we reach this point it means there are no matches
        return bear.numberOfElements;

        // end `compareHeaders` definition
    }

    function isCollapsed(thing) {
        return thing.classList.contains("collapsed");
    }

    function toggleCollapse(where) {
        where.classList.toggle("collapsed");
    }

    function getHeaderNum(who) {
        if ( who !== undefined ) {
            if ( who.length !== undefined ) {
                return who[0].tagName.slice(1);
            }
            else {
                return who.tagName.slice(1);
            }
        }
        return;
    }

    // just returns true if the the argument passed was a click event:
    function isClick(input) {
        return ( input.target !== undefined );
    }

    // what is the first (only) element that has `class="active"`?
    function whoIsActive() {
        return document.getElementsByClassName("active")[0];
    }

    function isAnythingHidden(things) {
        if ( things.length === undefined ) {
            return things.classList.contains("collapsed");
        }
        else {
            var anything = 0;
            for ( var i = 0; i < things.length; i++ ) {
                if ( things[i].classList.contains("collapsed") ) {
                    anything++;
                }
            }
            return ( anything > 0 ? true : false );
        }
    }

    /////////////////////////////
    // ACTIVE/SCROLL FUNCTIONS //
    /////////////////////////////

    function elemRelativeToActive(ref, down, num) {
        for ( var i = 0; i < ref.length; i++ ) {
            if ( ref[i].classList.contains("active") ) {
                // ref.length - 1 so we can't scroll beyond the last
                // header:
                if ( down && i < ( ref.length - 1) ) {
                    return ref[i + num];
                }
                // i > 0 so we can't go up beyond the first header:
                else if ( !down && i > 0 ) {
                    return ref[i - num];
                }
                // if we don't break it will loop forever
                break;
            }
        }
    }

    // `down` is a boolean: true is down, false is up
    function headerOneLevelUp(down) {
        var b = whoIsActive();
        for ( var k = 0; k < visible.length; k++ ) {
            if ( visible[k] === b ) {
                for ( var v = (down ? (k+1) : (k-1)); (down ? v < visible.length: v >= 0); (down ? v++ : v--) ) {
                    if ( isHeaderTag(visible[v].tagName) ) {
                        if ( (getHeaderNum(b) > getHeaderNum(visible[v])) || !isHeaderTag(b.tagName) ) {
                            return visible[v];
                        }
                    }
                }
                break;
            }
        }
    }

    function makeActive(me) {
        // uses global var "url"
        if ( me !== undefined ) {
            clearActive();
            me.classList.add("active");
            var id = me.getAttribute("id");
            if ( id !== null ) {
                window.location.replace(url + "#" + id);
            }
            me.scrollIntoView();
        }
    }

    function clearActive() {
        whoIsActive().classList.remove("active");
    }

    /////////////////////
    // OTHER FUNCTIONS //
    /////////////////////

    /// add event listener:
    // https://developer.mozilla.org/en-US/docs/DOM/element.addEventListener
    // http://stackoverflow.com/a/1841941/1431858
    /// only `type` argument is quoted (i.e.: window, "load", function())
    function addListener(element, type, response) {
        if (element.addEventListener) {
            element.addEventListener(type, response, false);
        }
        else if (element.attachEvent) {
            element.attachEvent("on" + type, response);
        }
    }

    // make a skeletal map of the direct children of <body>
    function buildABear() {
        var getStart = new Date();

        var source = document.body.children;
        var sourceLen = document.body.childElementCount;

        var bear = {numberOfElements: sourceLen};

        while ( sourceLen-- ) {
            bear[sourceLen] = {};
            var tempBear = bear[sourceLen];

            tempBear.tag = source[sourceLen].tagName;
            tempBear.classes = source[sourceLen].classList.toString().split(' ');

        }
        var getEnd = new Date();
        console.log("getElements() time: " + (getEnd - getStart));

        // end `buildABear` definition
        return bear;
    }

    function elemNumber(element, i) {
        while ( --i ) {
            if (elements[i] === element) {
                console.log("elemNumber: " + i);
                return i;
            }
        }
        return undefined;
    }

    function isHeaderTag(tag) {
        var t = tag;
        return ( t === "H1" || t === "H2" || t === "H3" || t === "H4" || t === "H5" || t === "H6" );
    }

    function isOneOf(thing, array) {
        for ( var i = 0; i < array.length; i++ ) {
            if ( thing === array[i] ) {
                return true;
            }
        }
        return false;
    }

    // end
})();
