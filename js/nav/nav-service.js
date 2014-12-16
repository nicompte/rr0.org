function NavLink(l, url, t) {
    this.label = l;
    this.link = url;
    this.title = t;
}

angular.module('rr0.nav')
    .service('navigationService', ['$rootScope', 'commonsService', 'netService', 'timeService', function ($rootScope, commonsService, netService, timeService) {
        'use strict';

        var startNav;
        var contents, contentsURL;
        var prev, prevLink;
        var next, nextLink;

        var navList;

        var style = null;

        var sections = [];

        var starts =
            [
                {
                    dir: "/tech/info/",
                    label: "Informatique",
                    css: "/js/pretty/prettify.css",
                    js: "/js/pretty/prettify.js",
                    onLoad: "prettyPrint()"
                },
                {
                    dir: "/science/crypto/ufo/",
                    label: "Ufologie"
                },
                {
                    dir: "/science/crypto/zoo/",
                    label: "Cryptozoologie"
                },
                {
                    dir: "/science/crypto/archeo/",
                    label: "Cryptoarch\xE9ologie"
                },
                {
                    dir: "/science/para/psi/",
                    label: "Parapsychologie"
                },
                {
                    dir: "/science/para/",
                    label: "Parasciences"
                },
                {
                    dir: "/science/crypto/",
                    label: "Cryptosciences"
                },
                {
                    dir: "/science/sur/fantome",
                    label: "Fant\xF4mes"
                },
                {
                    dir: "/science/sur/",
                    label: "Surnaturel"
                },
                {
                    dir: "/science/",
                    label: "Science"
                },
                {
                    dir: "/tech/",
                    label: "Technique"
                },
                {
                    dir: "/croyance/conspirationnisme/",
                    label: "Conspirationnisme"
                },
                {
                    dir: "/croyance/",
                    label: "Croyance"
                },
                {
                    dir: "/org/",
                    label: "<span class='iconic home'> <span class='label'>Organisations</span></span>",
                    title: "Organisations"
                },
                {
                    dir: "/politique/",
                    label: "Politique"
                }
            ];

        function setN(n, nLink) {
            if (!n) {
                n = next;
            }
//    addRel(nLink, "Next");

            var nes = document.getElementsByClassName("next");
            for (var i = 0; i < nes.length; i++) {
                var ne = nes[i];
                if (ne) {
                    ne.innerHTML = "<a href=\"" + nLink + "\" title='Suivant'> " + n + "</a>";
                }
            }
        }

        function setP(p, pLink) {
            if (!p) {
                p = prev;
            }
//    addRel(pLink, "Prev");

            var pes = document.getElementsByClassName("prev");
            for (var i = 0; i < pes.length; i++) {
                var pe = pes[i];
                if (pe) {
                    pe.innerHTML = "<a href=\"" + pLink + "\" title='Pr\xE9c\xE9dent'> " + p + "</a>";
                }
            }
        }
 
        return {
            currentLevel: 1,
            getNavList: function () {
                if (!navList) {
                    var n = document.getElementsByTagName("nav")[0];
                    navList = n.querySelector('ul');
                }
                return navList;
            },
            addRel: function (l, t) {
                var rel = document.createElement("link");
                rel.setAttribute("rel", t);
                rel.setAttribute("href", l);
                org.addToHead(rel);
            },
            nextFromTime: function (n) {
                var t = timeService.getTime();
                this.findTimeSibling(t.year, t.month,
                    function (y, m) {
                        if (m) {
                            if (m < 12) {
                                m++;
                                return {y: y, m: m};
                            } else {
                                m = 1;
                            }
                        }
                        y++;
                        return {y: y, m: m};
                    }, setN);
                n = "...";
                return n;
            },
            previousFromTime: function (p) {
                var t = timeService.getTime();
                this.findTimeSibling(t.year, t.month,
                    function (y, m) {
                        if (m) {
                            if (m > 1) {
                                m--;
                                return {y: y, m: m};
                            } else {
                                m = 12;
                            }
                        }
                        y--;
                        return {y: y, m: m};
                    }, setP);
                p = "...";
                return p;
            },
            setPrev: function (p, pLink) {
                if (!pLink) {
                    if (!p && !prev) {
                        if (timeService.getYear()) {
                            p = this.previousFromTime(p);
                        } else {
                            pLink = "..";   // Default previous is previous directory
                            setP(p, pLink);
                        }
                    } else {
                        pLink = "..";   // Default previous is previous directory
                        setP(p, pLink);
                    }
                }
                if (pLink) {
                    prevLink = pLink;
                }
                if (p) {
                    prev = p;
                }
            },
            setNext: function (n, nLink) {
                if (!nLink) {
                    if (!n && !next) {
                        if (timeService.getYear()) {
                            n = this.nextFromTime(n);
                        }
                    }
                }
                if (n) {
                    next = n;
                }
                if (nLink) {
                    nextLink = nLink;
                }
            },
            addStart: function (s) {
                starts.push(s);
            },
            setContents: function (c, cLink) {
                if (!contents) {
                    contents = c;
                    contentsURL = cLink;
                    // addRel(contentsURL, "Contents");
                }
            },
            findTimeSibling: function (oy, m, changeProc, foundProc) {
                var ret = changeProc(oy, m);
                var y = ret.y;
                var l = timeService.yearLink(y);
                m = ret.m;
                var label = y;
                var self = this;
                if (m) {
                    this.setContents(oy, timeService.yearLink(oy));
                    l += "/" + commonsService.zero(m);
                    label = timeService.monthNam(m - 1);
                    if (y !== timeService.getTime().year) {
                        label += ' ' + y;
                    }
                } else {
                    var cLink = timeService.yearLink(oy, true);
                    if (cLink !== commonsService.getUri()) {
                        this.setContents(~~(oy / 10) + "0s", cLink);
                    }
                }
                netService.onExists(l)
                    .success(function (req) {
                        foundProc(label, l);
                    }).error(function (failReq) {
                        self.findTimeSibling(y, m, changeProc, foundProc);
                    });
            },
            setStart: function (s, sLink) {
                if (!startNav) {
                    var ret = null;
                    var t;
                    if (window === top) {
                        if (!s) {                       // Look for start induced by URI
                            var uri = commonsService.getUri();
                            for (var i = 0; i < starts.length; i++) {
                                var st = starts[i];
                                var dataPos = uri.indexOf(st.dir);
                                if (dataPos >= 0 && uri !== st.dir) {
                                    s = st.label;
                                    t = st.title;
                                    sLink = st.dir;
                                    if (st.css) {
                                        commonsService.loadCSS(st.css);
                                    }
                                    if (st.js) {
                                        commonsService.loadJS(st.js);
                                    }
                                    if (st.onLoad) {
                                        ret = st.onLoad;
                                    }
                                    break;
                                }
                            }
                        }
                        if (!t) {
                            t = "D\xE9but";
                            s = "⇤ " + s;
                        }
                        startNav = new NavLink(s, sLink, t);
                    }
                    return ret;
                }
            },
            addSection: function (s, elem) {
                var l;
                var outlineL;
                if (s.indexOf('<h') < 0) {
                    l = '<h1>' + s + '</h1>';
                    var tag = 'h' + (this.currentLevel) + '>';
                    outlineL = '<' + tag + s + '</' + tag;
                } else {
                    l = s;
                    outlineL = l;
                }
                this.currentLevel++;
                var levelSections = sections[this.currentLevel];
                if (typeof levelSections !== "array") {
                    levelSections = sections;
                }
                levelSections.push(l);

                var section = {
                    label: l,
                    outlineLabel: outlineL,
                    id: commonsService.camelize(commonsService.validLink(s), this.currentLevel),
                    level: this.currentLevel,
                    elem: elem
                };
                $rootScope.$broadcast('sectionAdded', section);
                return section;
            },
            getContents: function () {
                return contents;
            },
            getPrev: function () {
                return prev;
            },
            getPrevLink: function () {
                return prevLink;
            },
            getNext: function () {
                return next;
            },
            getNextLink: function () {
                return nextLink;
            },
            getContentsURL: function () {
                return contentsURL;
            },
            getStartNav: function () {
                return startNav;
            }
        };
    }]);