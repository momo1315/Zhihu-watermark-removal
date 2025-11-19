// ==UserScript==
// @name         知乎图片去水印（全站 + 动态加载支持）
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  自动替换知乎图片链接中的 token，使用 data-original-token 获取无水印原图（支持所有子域和懒加载）
// @author       You
// @match        *://*.zhihu.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const ZHIHU_IMG_HOST = 'zhimg.com';

    /**
     * 从 URL 中提取形如 v2-xxxxxxxx 的 token
     */
    function extractV2Token(url) {
        const match = url.match(/(v2-[0-9a-f]{32})/);
        return match ? match[1] : null;
    }

    /**
     * 安全替换 URL 中的旧 token 为新 token
     */
    function replaceToken(url, oldToken, newToken) {
        if (!url || !oldToken || !newToken || oldToken === newToken) return url;
        return url.replace(oldToken, newToken);
    }

    /**
     * 处理单张图片
     */
    function processImage(img) {
        // 避免重复处理
        if (img.hasAttribute('data-unwatermarked')) return;

        const token = img.getAttribute('data-original-token');
        const src = img.src;

        // 必须同时满足：有 data-original-token + 是知乎图片
        if (!token || !src || !src.includes(ZHIHU_IMG_HOST)) {
            return;
        }

        const oldToken = extractV2Token(src);
        if (!oldToken) return;

        // 防止无效替换（虽然 token 不同，但确保新 token 是合法格式）
        if (!/^v2-[0-9a-f]{32}$/.test(token)) return;

        // 替换 src
        const newSrc = replaceToken(src, oldToken, token);
        img.src = newSrc;

        // 替换 data-original（如有）
        const dataOriginal = img.getAttribute('data-original');
        if (dataOriginal && dataOriginal.includes(oldToken)) {
            const newDataOriginal = replaceToken(dataOriginal, oldToken, token);
            img.setAttribute('data-original', newDataOriginal);
        }

        // 标记已处理
        img.setAttribute('data-unwatermarked', 'true');
    }

    /**
     * 批量处理当前 DOM 中所有符合条件的图片
     */
    function processAllImages() {
        // 使用更宽泛的选择器：只要 img 有 data-original-token 即尝试处理
        document.querySelectorAll('img[data-original-token]').forEach(img => {
            if (img.complete) {
                // 图片已加载，直接处理
                processImage(img);
            } else {
                // 图片未加载，等加载完再处理（避免 src 为空）
                img.addEventListener('load', () => processImage(img), { once: true });
            }
        });
    }

    // 初始处理
    processAllImages();

    // 监听 DOM 变化：覆盖动态插入的图片（如评论、回答懒加载）
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node;
                        // 如果新增节点本身就是目标 img
                        if (element.matches && element.matches('img[data-original-token]')) {
                            if (element.complete) {
                                processImage(element);
                            } else {
                                element.addEventListener('load', () => processImage(element), { once: true });
                            }
                        }
                        // 如果新增节点包含子 img
                        if (element.querySelectorAll) {
                            element.querySelectorAll('img[data-original-token]').forEach(img => {
                                if (img.complete) {
                                    processImage(img);
                                } else {
                                    img.addEventListener('load', () => processImage(img), { once: true });
                                }
                            });
                        }
                    }
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();