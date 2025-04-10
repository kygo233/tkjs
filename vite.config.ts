import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import monkey from "vite-plugin-monkey";
import { siteList } from "./src/utils/siteList";

export default defineConfig(({ mode }) => {
    const includes = siteList.map(v => v.domainReg);
    if (mode === "development") {
        includes.push(/(localhost|192.168.*)\/jav\/*/);
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
                    include: includes,
                },
            }),
        ],
    };
});
