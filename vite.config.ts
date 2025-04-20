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
                    name: "JAVBUS封面大图",
                    namespace: "https://github.com/kygo233/tkjs/",
                    version: "2025.03.22",
                    description: "javbus和javdb界面优化",
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
