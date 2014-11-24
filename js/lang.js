var docLang;
var userLang = "fr";
angular.module('rr0.lang', ['rr0.net'])
    .service('langService', ['commonsService', 'netService', function (commonsService, netService) {
        "use strict";

        function notifyOrig(original, origFound) {
            netService.onExists(original, function () {
                origFound(original);
            }, function () {
                origFound(null);
            });
        }

        function notifyTrans(translation, transFound) {
            netService.onExists(translation, function () {
                transFound(translation);
            }, function () {
                transFound(null);
            });
        }

        /**
         * Get the URI of the original document, if any.
         * By convention, a suffixed document is a translation, and the original is without this suffix.
         * Thus, an original is always without suffix, typically index.html.
         * So an original english will be index.html (with html lang="en") and its translation index_fr.html,
         * and an original french will be index.html (with html lang="fr") and there will be no translation (or its translation will be index_en.html),
         * If the suffix is not explicit, we need to check.
         *
         * uri:http://rr0.org/data/a/a/a/a/m/Something/index_fr.html --> original is http://rr0.org/data/a/a/a/a/m/Something/index.html
         * uri:http://rr0.org/data/a/a/a/a/m/Something/index.fr --> original is the same
         * uri:http://rr0.org/data/a/a/a/a/m/Something/ --> if http://rr0.org/data/a/a/a/a/m/Something/index_fr.html exists, original is http://rr0.org/data/a/a/a/a/m/Something/index.html
         *
         * @param uri
         */
        return {
            setLang: function (l) {
                if (!l) {
                    l = document.documentElement.lang;
                }
                docLang = l;
            },
            checkAlternate: function (uri, origStatus, transStatus) {
                var dotPos = uri.lastIndexOf(".");
                var pageSpecified = dotPos > 0;
                var translation;
                if (pageSpecified) {    // index.html or index_fr.html
                    var sPos = uri.lastIndexOf('_');
                    if (sPos === dotPos - 3) {
                        var orig1 = uri.substring(0, sPos) + uri.substring(sPos + 3);
                        notifyOrig(orig1, origStatus);
                        return;
                    } else {
                        translation = uri.substr(0, dotPos) + "_" + userLang + uri.substr(dotPos);
                    }
                } else {
                    if (docLang !== userLang) {
                        translation = commonsService.addEndingSlash(uri) + "index_" + userLang + ".html";
                    }
                }
                if (translation) {
                    if (docLang !== userLang) {
                        notifyTrans(translation, transStatus);
                    } else {
                        var orig2 = commonsService.addEndingSlash(uri.substring(0, uri.lastIndexOf('/'))) + "index.html";
                        notifyTrans(translation, function (trans) {  // If there is a translation it's myself (default priority is to my language)
                            if (trans) {    // If there is an translation (myself), check for original
                                notifyOrig(orig2, origStatus);
                            }
                        });
                    }
                }
            }
        };
    }])
    .run(['langService', function (langService) {
        'use strict';
        langService.setLang();
    }]);
