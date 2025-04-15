const LOCALE = {
    menu_autoPage: ["自动下一页", "Auto Next Page"],
    menu_pageHistory: ["地址栏显示下一页", "Show the next page in the URL bar"],
    menu_newWindow: ["新窗口打开详情页", "Open the details page in a new window"],
    menu_toolbar: ["功能图标", "Tools icons"],
    menu_toolbar_autoHide: ["功能图标自动隐藏", "Tools icons auto hide"],
    menu_avInfo: ["磁力弹窗中的演员和图片", "Actors and images in magnet pop-ups"],
    menu_halfImg: ["竖图模式", "Vertical image mode"],
    menu_fullTitle: ["标题全显", "Full title"],
    menu_autoColumn: ["自适应列数", "Adaptive columns"],
    menu_uncensoredFilter: ["去掉未经审查的泄露", "Remove uncensored leaks"],
    menu_maxWidth: ["最大宽度", "Max width"],
    menu_previewSite: ["预览图", "Preview image website"],
    menu_linkUrl: ["跳转到", "Jump to"],
    copyButton: ["复制", "Copy"],
    copySuccess: ["复制成功", "Copy successful"],
    preview_norespond: ["无法响应或网络错误", "No respond"],
    preview_none: ["未搜索到", "No results found"],
    //tip_dragToCopy: ["抓取复制", "Drag to copy"],
    tip_magnet: ["磁力", "Magnet"],
    //tip_download: ["下载封面", "Download cover"],
    tip_preview: ["视频截图", "Video screenshot"],
    tip_link: ["跳转", "link to url"],
    autoPage_end: ["完", "End"],
    request_invalidUrl: ["无效的网址", "invalid Url"],
};
const language = navigator.language.toLowerCase().replace("_", "-").split("-")[0];
const LOCALE_INDEX = language === "zh" ? 0 : 1;
const LANG = Object.fromEntries(Object.entries(LOCALE).map(([key, value]) => [key, value[LOCALE_INDEX]]));
export default LANG;
