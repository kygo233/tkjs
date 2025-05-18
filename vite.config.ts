import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import monkey from "vite-plugin-monkey";
import { siteList } from "./src/utils/siteList";

const include = siteList.map(v => v.domainReg);
const connect = ["javbus.com", "javfree.me", "blogjav.net", "missav.ws"];
export default defineConfig(({ mode }) => {
    if (mode === "development") {
        include.push(/(localhost|192.168.*)\/jav\/*/);
    }
    return {
        server: {
            host: true, // 监听所有网络接口
        },
        plugins: [
            svelte(),
            monkey({
                entry: "src/main.ts",
                userscript: {
                    name: {
                        "": "larger thumbnails v2",
                        "zh-CN": "封面大图v2",
                    },
                    namespace: "https://github.com/kygo233/tkjs/",
                    version: "2025.03.22",
                    description: {
                        "": "Use larger thumbnails on javbus and javdb. 123av,jable,and missav can get magnet from javbus",
                        "zh-CN": "javbus和javdb封面大图; 123av,jable,missav获取javbus的磁力",
                    },
                    homepage: "https://sleazyfork.org/",
                    author: "kygo233",
                    license: "MIT",
                    include,
                    connect,
                },
            }),
        ],
    };
});
