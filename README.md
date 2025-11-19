## 使用步骤

1. 在浏览器下载一个**Tampermonkey**油猴插件
2. 新建一个脚本，复制repo里的js代码进去
3. 刷新知乎，就可以享受没有水印的图片啦



## 原理

如果你感兴趣的话，可以随便看看

知乎图片的代码为：`<img src="https://pica.zhimg.com/v2-871a3ef565dac524b6464f11fd8242bc_1440w.jpg" data-rawwidth="3023" data-rawheight="1688" data-size="normal" data-original-token="v2-59f1ec66ab9fcdea7be7d0a12412771c" class="origin_image zh-lightbox-thumb" width="3023" data-original="https://pica.zhimg.com/v2-871a3ef565dac524b6464f11fd8242bc_r.jpg">`

找到类似这样的元素，如果有data-original-token，那么就开始替换，否则维持原样不操作。
替换的流程是，图片原始链接中的v2-871a3ef565dac524b6464f11fd8242bc给替换成data-original-token，同时，data-original也要做相应的替换。

