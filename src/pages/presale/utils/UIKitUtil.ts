import UIkit from "uikit"

interface IUIKitUtil {
    on(id: string | HTMLElement, eventName: string, callback: Function): void;
}

export const UIKitUtil = UIkit.util as IUIKitUtil
