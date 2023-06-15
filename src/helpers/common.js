import { _databaseGetUserProfile, _databaseUpdateUserProfile  } from "../helpers/database";
import { _authGetCurrentUser } from "../helpers/auth";

const info = {
    showLog: false,
    beforeEnterApp: true,
    chatDate: "",
    selectedRoom: "",
    themeInfo: {},
    theme_dark : {theme:"dark", themeBtnValue:"LIGHT"},
    theme_light: {theme:"light", themeBtnValue:"DARK"},
    roomList: [],
    chatFocused: false
};

export function _commonHandleUserTheme(callback) {
    _databaseGetUserProfile(_authGetCurrentUser(), function(profile) {
        let theme = "light";
        if(!profile) {
            _databaseUpdateUserProfile("theme", theme, _authGetCurrentUser());
        }else {
            theme = profile.theme;
        }
        info.themeInfo = info["theme_"+theme];
        callback(info.themeInfo);
    });
}
export function _commonGetCommonInfo(key) {
    return info[key];
}
export function _commonSetCommonInfo(key, value) {
    info[key] = value;
}
export function _commonTimestampToDate(timestamp) {
    let date = new Intl.DateTimeFormat("ko-KR", {  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: 'h23' }).format(timestamp);
    return date;
}
export function _commonGetToday() {
    const date = new Date();
    const today = date.getFullYear()+""+("0" + (date.getMonth() + 1)).slice(-2)+""+("0" + date.getDate()).slice(-2);
    return today;
}
