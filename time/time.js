var org = org || {}; // Useless as we depend on org functions
org.rr0 = org.rr0 || {};
org.rr0.time = (function () {

    /**
     * http://www.w3.org/html/wg/drafts/html/master/text-level-semantics.html#the-time-element
     * http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#global-dates-and-times
     *
     * ((-)?[1-9]\d{3})(-(\d{1,2})(-(\d{1,2})(T\d{1,2}:\d{1:2])?)?)?
     *
     * 1947-06-21T14:20-02:00
     */
    this.uriPart = "/time/";

    this.isTimeURL = function (u) {
        if (!u) {
            u = org.getUri();
        }
        return u.indexOf(this.uriPart) === 0;
    };

    var dayOfWeekNames = {
        "fr": [ "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi" ],
        "en": [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ]
    };
    var monthNames = {
        "fr": [ "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre" ],
        "en": [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]
    };

    function paramLang(lang) {
        return (!lang) ? org.rr0.context.language : lang;
    }

    this.dayOfWeekNam = function (d, lang) {
        return dayOfWeekNames[paramLang(lang)][d];
    };

    function monthNam(m, lang) {
        return monthNames[paramLang(lang)][m];
    }

    var times;

    function getTimes() {
        if (!times) {
            times = new google.visualization.DataTable();
            times.addColumn('string', 'Heure');
            times.addColumn('number');
            for (var i = 0; i < 24; i++) {
                times.addRow([i + "", 0]);
            }
        }
        return times;
    }

    this.chartZone = null;
    var chart;

    this.drawChart = function () {
        if (times) {
            var options = {
                'title': "Heures d'observation",
                'width': this.chartZone.offsetWidth,
                'height': this.chartZone.offsetHeight - document.getElementById("head").offsetHeight,
                legend: {position: 'none'}
            };
            chart.draw(times, options);
        } else {
            setChartsHeight(0);
        }
    };


    class Duration {
        constructor() {
            this.durationRegex = /P(\d+D)*(\d+H)*(\d+M)*(\d+S)*/;
            this.minuteValue = 60;
            this.hourValue = this.minuteValue * 60;
            this.dayValue = this.hourValue * 24;
        }

        fromString (txt) {
            var foundExprs = this.durationRegex.exec(txt);
            this.durationInSeconds = 0;
            for (var i = 1; i < foundExprs.length; i++) {
                var expr = foundExprs[i];
                if (expr) {
                    var lastCharPos = expr.length - 1;
                    var value = parseInt(expr.substring(0, lastCharPos), 10);
                    switch (expr.charAt(lastCharPos)) {
                        case 'D':
                            this.durationInSeconds += value * this.dayValue;
                            break;
                        case 'H':
                            this.durationInSeconds += value * this.hourValue;
                            break;
                        case 'M':
                            this.durationInSeconds += value * this.minuteValue;
                            break;
                        case 'S':
                            this.durationInSeconds += value;
                            break;
                        case 'P':
                    }
                }
            }
            return this;
        }

        toString() {
            var txt = [];
            var remaining = this.durationInSeconds;
            var days = Math.floor(remaining / dayValue);
            if (days >= 1) {
                txt.push(days + "&nbsp;jour" + (days > 1 ? 's' : ''));
            }
            remaining = remaining % dayValue;
            var hours = Math.floor(remaining / hourValue);
            if (hours >= 1) {
                txt.push(hours + "&nbsp;heure" + (hours > 1 ? 's' : ''));
            }
            remaining = remaining % hourValue;
            var minutes = Math.floor(remaining / minuteValue);
            if (minutes >= 1) {
                txt.push(minutes + "&nbsp;minute" + (minutes > 1 ? 's' : ''));
            }
            remaining = remaining % minuteValue;
            var seconds = remaining;
            if (seconds >= 1) {
                txt.push(seconds + "&nbsp;seconde" + (seconds > 1 ? 's' : ''));
            }
            var last = txt.length - 1;
            var s = '';
            for (var i = last; i >= 0; i--) {
                s = (i === last && i > 0 ? ' et ' : i > 0 ? ', ' : '') + txt[i] + s;
            }
            return s;
        }
    }

    this.Moment = function () {
        function clear() {
            this.decade = false;
            this.dayOfMonth = null;
            this.timeZone = null;
            this.year = null;
            this.month = null;
            this.hour = null;
            this.minutes = null;
            this.seconds = null;
        }

        clear.call(this);

        this.setSeconds = function (s) {
            this.seconds = s;
        };

        this.setMinutes = function (mn) {
            this.minutes = mn;
            this.setSeconds();
        };

        this.setHour = function (h) {
            this.hour = h;
            this.setMinutes();
        };

        this.setTimeZone = function (z) {
            this.timeZone = z;
        };

        this.setDayOfMonth = function (d) {
            this.dayOfMonth = d;
            this.setHour();
        };

        this.setMonth = function (m) {
            this.month = m;
            this.setDayOfMonth();
        };

        this.setYear = function (number) {
            this.year = number;
            this.setMonth();
        };

        this.getYear = function () {
            return this.year;
        };

        this.getMonth = function () {
            return this.month;
        };

        this.getDayOfMonth = function () {
            return this.dayOfMonth;
        };

        this.getHour = function () {
            return this.hour;
        };

        this.getMinutes = function () {
            return this.minutes;
        };

        this.getTimeZone = function () {
            return this.timeZone;
        };

        this.isApprox = function () {
            return this.approx;
        };

        this.fromString = function (dString) {
            var number;
            var era;
            var txt;
            var monthReady;
            var zReady;

            function resetParse() {
                clear.call(this);
                number = null;
                era = 1;
                txt = "";
                monthReady = undefined;
                zReady = undefined;
            }

            resetParse();

            function setTz(c) {
                var z;
                switch (txt) {
                    case 'Z':
                    case 'UTC':
                    case 'TU':
                    case 'UT':
                    case 'GMT':
                        z = 0;
                        break;
                    case 'EGT':
                        z = -1;
                        break;
                    case 'ADT':
                    case 'HAA':
                    case 'WGT':
                        z = -3;
                        break;
                    case 'EDT':
                    case 'AST':
                    case 'HAE':
                        z = -4;
                        break;
                    case 'EST': // Eastern Daylight Time
                    case 'CDT':
                    case 'ET':
                    case 'HAC':
                        z = -5;
                        break;
                    case 'CST':
                    case 'MDT':
                        z = -6;
                        break;
                    case 'MST':
                    case 'PDT':
                        z = -7;
                        break;
                    case 'PST':
                        z = -8;
                        break;
                    default:
                        return;
                }
                this.setTimeZone(z);
                txt = null;
            }

            function value() {
                return number != null ? zReady ? number : txt + number : txt != null ? txt : null;
            }

            var i;

            function timeSet() {
                if (this.year != null && number <= 59) {
                    monthReady = monthReady || dString.charAt(i) == '-';
                    if (!monthReady) {
                        if (this.month != null) {
                            if (this.dayOfMonth != null || this.hour != null) {
                                if (this.hour != null) {
                                    if (this.minutes != null) {
                                        this.setDayOfMonth(value());     // setHour is processed after ':' only
                                    } else {
                                        this.setMinutes(value());
                                    }
                                } else {
                                    this.setDayOfMonth(value());     // setHour is processed after ':' only
                                }
                            } else {
                                this.setDayOfMonth(value());
                            }
                        } else {
                            // Probably just text
                        }
                    } else {
                        this.setMonth(value());
                        monthReady = false;
                    }
                } else if (this.hour != null) {
                    this.setMinutes(value());
                } else {
                    this.setYear(era * number);
                    monthReady = true;
                }
                number = null;
            }

            function parseEnd() {
                if (value() != null) {
                    timeSet.call(this); // End of date
                }
                if (txt) {
                    setTz.call(this);
                }
            }

            for (i = 0; i < dString.length; i++) {
                var c = dString.charAt(i);
                switch (c) {
                    case '0':
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9':
                        var digit = (c - '0');
                        if (number == null) {
                            number = digit * era;
                        } else {
                            number = number * 10 + digit;
                        }
                        break;
                    case '-':
                        if (!txt) {
                            if (number == null) {
                                era = -1;
                            }
                            this.setHour(null);  // Next value cannot be minutes
                            timeSet.call(this); // End of year or month
                        } else {
                            txt += c;
                        }
                        break;
                    case 's':
                        if (number != null && txt.charAt(i - 1) != ' ') {
                            this.decade = true;
                        } else {
                            txt += c;
                        }
                        break;
                    case '+':
                        era = 1;
                        break;
                    case '~':
                        this.approx = true;
                        break;
                    case ':':
                        if (this.hour != null && zReady) {
                            this.setTimeZone(number * era);
                        } else {
                            this.setHour(value());
                            zReady = true;
                        }
                        number = null;
                        break;
                    case 'T':
                        var hourNumber = !isNaN(dString.charAt(i + 1));
                    case ' ':
                        if (!hourNumber && (txt || zReady)) {
                            txt += c;
                        } else {
                            timeSet.call(this); // End of date
                        }
                        break;
                    case '/':
                        parseEnd.call(this);
                        this.startDate = org.clone(this);
                        resetParse();
                        break;
                    default:
                        if (digit) {
                            txt += digit;
                            number = null;
                            digit = null;
                        }
                        txt += c;
                }
            }
            parseEnd.call(this);
            return this;
        };

        this.toISOString = function () {
            var s = this.year;
            if (this.month) {
                s += '-' + zero(this.month);
            }
            if (this.dayOfMonth) {
                s += '-' + zero(this.dayOfMonth);
            }
            if (this.hour) {
                s += zero(this.hour) + ":" + zero(this.minutes);
            }
            return s;
        }
    };

    org.rr0.context.time = new this.Moment();

    this.getTime = function () {
        return org.rr0.context.time;
    };

    var today = new Date();

    this.setYear = function (y) {
        if (y) this.getTime().year = y;
    };

    this.getYear = function () {
        var t = this.getTime();
        if (!t.year) {
            var u = org.getUri();
            if (this.isTimeURL(u)) {
                var parts = u.split("/");
                t.year = 0;
                var mul = 1000;
                for (var i = 2; i < parts.length; i++) {
                    var v = parts[i];
                    if (org.isNumber(v)) {
                        if (i <= 5) {
                            t.year += v * mul;
                            mul /= 10;
                        } else if (!t.month) t.month = parseInt(v, 10);
                        else if (!t.dayOfMonth) t.dayOfMonth = parseInt(v, 10);
                    } else
                        break;
                }
            }
        }
        return t.year;
    };

    /**
     *
     * @param w
     * @return {*} January = 1
     */
    function monthIndex(w) {
        return org.arrayIndex(w, monthNames[org.rr0.context.language]);
    }

    /**
     * Builds a address to link to a year page/directory.
     *
     * @param y The year
     * @param decade if the year (such as "1950") is to be understood as a decade (1950s).
     * @returns {string} The link
     */
    this.yearLink = function (y, decade) {
        var yString = y.toString();
        var yLink = uriPart;
        var pos = 0;
        yLink += (y < 1000 ? "0" : yString.substring(pos, ++pos)) + "/";
        yLink += (y < 100 ? "0" : yString.substring(pos, ++pos)) + "/";
        yLink += (y < 10 ? "0" : yString.substring(pos, ++pos)) + "/";
        if (!decade) yLink += yString.substring(pos, ++pos);
        return yLink;
    };

    this.setMonth = function (m) {
        if (m) {
            this.getTime().setMonth(m);
        }
    };

    this.monthName = function (m) {
        var t = this.getTime();
        if (!m && t.month) m = t.month;
        return monthNam(m - 1);
    };

    function addMonth(m) {
        var s = "";
        var t = this.getTime();
        if (m) t.month = m;
        if (t.month) {
            var mName = monthName();
            s += mName;
        }
        return s;
    }

    function addYear(y, yLink, t) {
        var s = "";
        if (!y) y = this.getTime().year;
        if (!yLink) yLink = this.yearLink(y);
        if (!t) {
            var p = getPeople();
            if (p) {
                t = p.toString();
                if (p.born) t += " a " + (y - p.born.getFullYear()) + " ans";
                else t = "Naissance de " + t;
            }
        }
        if (y) s += org.link(yLink, y, t);
        return s;
    }

    /**
     *
     * @param d
     * @param dow Day of week
     * @returns {string}
     */
    function addDayOfMonth(d, dow) {
        var s = "";
        var t = this.getTime();
        if (!d) d = t.dayOfMonth;
        if (d) {
            var dayName = dayOfWeekNam(this.getDayOfWeek(t.year, t.month, d));
            s += dayName + " ";
            s += (d == 1 ? "1<sup>er</sup>" : d);
        }
        return s;
    }

    function setHour(h) {
        if (h) this.getTime().hour = h;
    }

    function setMinutes(mn) {
        if (mn) this.getTime().minutes = mn;
    }

    function getHour() {
        return this.getTime().hour;
    }

    this.setDayOfMonth = function (d) {
        if (d) {
            var t = this.getTime();
            t.dayOfMonth = d;
            t.hour = null;
            t.minutes = null;
        }
    };

    this.getDayOfMonth = function () {
        return this.getTime().dayOfMonth;
    };

    function getMonth() {
        return this.getTime().month;
    }

    function getDate(y, m, d) {
        var dat;
        if (!y) y = this.getYear();
        if (y) {                    // No getTime().year set means no date set
            dat = new Date();
            dat.setFullYear(y);
            if (!m) m = getMonth();
            if (m) dat.setMonth(m - 1);
            if (!d) d = this.getDayOfMonth();
            dat.setDate(d);
        }
        return dat;
    }

    this.getDayOfWeek = function (y, m, d) {
        return getDate(y, m, d).getDay();
    };

    this.addDate = function (p, y, m, d) {
        if (!y) y = this.getTime().year;
        var s = "";
        if (y) {
            if (!m) m = getMonth();
            if (!d) d = this.getTime().dayOfMonth;
            var newDate = new Date();
            newDate.setFullYear(y);
            var dateLink = this.yearLink(y);
            if (m) {
                newDate.setMonth(m);
                dateLink += "/" + zero(m);
                if (d) {
                    newDate.setDate(d);
//                s = "le ";
                    s += addDayOfMonth(d);
                    dateLink += "/" + zero(d);
                } else {
//                s = "en ";
                }
                s += " " + addMonth(m);
            } else {
//            s += "en ";
            }
            var t = null;
            s += " " + addYear(y, dateLink, t);
        }
        return s;
    };

    this.findTimeSibling = function (oy, m, changeProc, foundProc) {
        var ret = changeProc(oy, m);
        var y = ret.y;
        var l = this.yearLink(y);
        m = ret.m;
        var label = y;
        if (m) {
            setContents(oy, this.yearLink(oy));
            l += "/" + zero(m);
            label = monthNam(m - 1);
            if (y != this.getTime().year) label += ' ' + y;
        } else {
            var cLink = this.yearLink(oy, true);
            if (cLink != this.getUri()) {
                setContents(~~(oy / 10) + "0s", cLink)
            }
        }
        org.onExists(l, function (req) {
            foundProc(label, l);
        }, function (failReq) {
            this.findTimeSibling(y, m, changeProc, foundProc);
        });
    };

    var preYearWords = ["en", "de", "à", "dès", "vers", "depuis", "jusqu'en", "année", "années", "fin", "début", "printemps", "été", "automne", "hiver", "avant", "entre", "et", "ou"];
    var preMonthWords = ["en", "de", "à", "dès", "vers", "depuis", "jusqu'en", "mois", "fin", "début", "avant", "entre", "et", "ou"];
    var preDayWords = ["au", "le", "du", "à", "vers", "jusqu'au",
        "Au", "Le", "Du", "À", "Vers", "Jusqu'au"];

    function preMonthWord(w) {
        return org.arrayIndex(w, preMonthWords);
    }

    function preDayWord(w) {
        return org.arrayIndex(w, preDayWords);
    }

    function preYearWord(w) {
        return org.arrayIndex(w, preYearWords);
    }

    function handleListItem(e) {
        var uls = e.getElementsByTagName("UL");
        if (!org.hasClass(e, org.constantClass) && uls.length > 0) {
            var details = document.createElement("details");
            details.setAttribute("open", "");
            var ul = uls[0];
            var sum = document.createElement("summary");
            sum.appendChild(e.children[0]);
            details.appendChild(sum);
            details.appendChild(ul);
            e.parentNode.replaceChild(details, e);
        }
    }

    var dateRegex = /(-)?[1-9]\d{3}(-\d{1,2}(-\d{1,2})?)?/g;

    function affectsContext(e) {
        return !org.hasClass(e.parentNode, "source") && !org.hasClass(e.parentNode, "note");
    }

    this.timeTextHandler = function (e) {
        if (org.rr0.time.isTimeURL() && e.tagName == "LI") {
            return handleListItem(e);
        }
        if (e.parentNode.tagName === "TIME") return;

        var txt = org.textValue(e);
        var parentNode = e.parentNode;

        function regexFound(foundExprs) {
            var toReplace = foundExprs[0];
            var s;
            if (txt.substring(0, 1) == '-') s = toReplace;
            else s = toReplace.split('-');
            var y = s[0];
            if (org.isNumber(y) && y <= today.getFullYear()) {
                var wBefore = org.wordBefore(txt, foundExprs.index).toLowerCase();
                var mIndexBefore = monthIndex(wBefore);
                var isPreYearWord = preYearWord(wBefore);
                var isPreMonthWord = preMonthWord(wBefore);
                var isPreDayWord = preDayWord(wBefore);
                if (wBefore == "" || mIndexBefore || isPreYearWord || isPreMonthWord || isPreDayWord) {
                    if (!mIndexBefore) {
                        var nextPos = foundExprs.index + y.length;
                        var wAfter = org.wordAfter(txt, nextPos);
                        var nextChar = txt.charAt(nextPos);
                    }
                    if (parentNode) {
                        if (mIndexBefore || wAfter == "" || org.isProNoun(wAfter) || !(org.isPlural(wAfter) && !org.isProperName(wAfter)) && !org.arrayIndex(wAfter, units) && !monthIndex(wAfter)) {     // Plural on a sibling noun means count rather than getTime().year
                            var affectsCtx = affectsContext(e);
                            if (affectsCtx) {
                                org.rr0.time.setYear(y);
                            }
                            if (org.wordBefore(txt, foundExprs.index - wBefore.length) == "naît")
                                getPeople().born = y;
                            var title = parentNode.title;
                            if (title) {
                                var first;
                                var dash = title.indexOf('-');
                                if (dash > 0) first = title.substring(0, dash);
                                else first = title;
                                if (first < y) {
                                    first += '-';
                                } else {
                                    y = first;
                                    first = "";
                                }
                            } else first = "";
                            parentNode.title = first + org.rr0.time.getTime().year;
                            var peo = getPeople();
                            if (peo) {
                                var age = org.rr0.time.getTime().year - peo.born;
                                if (age > 0) {
                                    parentNode.title += " : " + peo.lastName + " a " + age + " ans";
                                }
                            }
                            var decade = nextChar === 's';      // Decade quoted as "1940s" for example
                            var replacement = toReplace;
                            var dateLink;
                            if (mIndexBefore) {
                                dateLink = org.rr0.time.yearLink(y) + "/" + zero(mIndexBefore);
                            } else {
                                dateLink = org.rr0.time.yearLink(y, decade);
                                if (s.length > 1 && s.length <= 3) {
                                    mIndexBefore = parseInt(s[1], 10);
                                    if (affectsCtx) {
                                        org.rr0.time.setMonth(mIndexBefore);
                                    }
                                    dateLink += "/" + zero(mIndexBefore);
                                    replacement = org.rr0.time.monthName(mIndexBefore) + " " + y;
                                    if (s.length > 2) {
                                        var jIndex = parseInt(s[2], 10);
                                        if (affectsCtx) {
                                            org.rr0.time.setDayOfMonth(jIndex);
                                        }
                                        dateLink += "/" + zero(jIndex);
                                        replacement = org.rr0.time.dayOfWeekNam(org.rr0.time.getDayOfWeek(y, mIndexBefore, jIndex)) + " " + jIndex + (jIndex == 1 ? "er" : "") + " " + replacement;
                                    }
                                }
                            }
                            checkedLink(e, toReplace, dateLink, replacement, true);
                        }
                    }
                }
            }
        }

        if (txt) {
            var foundExprs;
            while ((foundExprs = dateRegex.exec(txt)) !== null) {
                regexFound(foundExprs);
            }
        }
        return false;
    };
    this.setChartsHeight = function (h) {
        this.chartZone.style.height = h + '%';
        org.getSideZone("map-canvas").style.height = (100 - h) + '%';
    };
    return this;
})();