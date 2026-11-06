# 图片素材来源

本作事件页使用了经裁剪、压缩和色调调整的公开图片。战斗页背景全部由游戏 Canvas 程序绘制，不使用实拍照片。

| 游戏内文件 | 原图 | 作者 | 许可 | 来源 |
| --- | --- | --- | --- | --- |
| `assets/events/chishui-river.webp` | Gujin ChishuiByHighestBridges | HighestBridges | CC BY 4.0 | <https://commons.wikimedia.org/wiki/File:Gujin_ChishuiByHighestBridges.jpg> |
| `assets/events/chishui-town.webp` | Chishui River Bank in Maotai Town | Wahsaw | CC0 | <https://commons.wikimedia.org/wiki/File:Chishui_River_Bank_in_Maotai(Moutai)_Town,_Renhuai_City,_Zunyi,_Guizhou.jpg> |
| `assets/events/jinsha-ferry.webp` | Jinsha River - panoramio | ogwen | CC BY-SA 3.0 | <https://commons.wikimedia.org/wiki/File:Jinsha_River_-_panoramio.jpg> |
| `assets/events/jinsha-gorge.webp` | Jinsha River at Tiger Leaping Gorge | Wingchi Poon | CC BY-SA 3.0 | <https://commons.wikimedia.org/wiki/File:Jinsha_River_at_Tiger_Leaping_Gorge.JPG> |
| `assets/events/dadu-river.webp` | Dadu River in Luding County, Picture3 | Huangdan2060 | CC0 | <https://commons.wikimedia.org/wiki/File:Dadu_River_in_Luding_County,_Sichuan,_China,_2018,_Picture3.jpg> |
| `assets/events/luding-bridge.webp` | Luding Bridge over the Dadu River | Huangdan2060 | CC0 | <https://commons.wikimedia.org/wiki/File:Luding_Bridge_over_the_Dadu_River,_in_Luding_County,_Sichuan,_China,_2018.jpg> |
| `assets/events/jiajin-snow.webp` | 翻越夹金山风景 - panoramio | Lau Phang | CC BY-SA 3.0 | <https://commons.wikimedia.org/wiki/File:翻越夹金山风景_-_panoramio.jpg> |
| `assets/events/snow-terrain.webp` | Huining, Baiyin, Gansu, China - panoramio | hexg | CC BY 3.0 | <https://commons.wikimedia.org/wiki/File:Huining,_Baiyin,_Gansu,_China_-_panoramio.jpg> |
| `assets/events/grassland.webp` | 九曲黄河第一湾1 | Zhangmoon618 | Public domain | <https://commons.wikimedia.org/wiki/File:九曲黄河第一湾1.JPG> |
| `assets/events/grassland-road.webp` | 九曲黄河第一湾1（不同裁剪） | Zhangmoon618 | Public domain | 同上 |

## 修改说明

- 原图统一裁剪为 16:9，并转为 WebP。
- 为适配游戏 UI，做了轻微去饱和、裁切和暗化处理。
- CC BY-SA 图片的衍生版本继续按对应 CC BY-SA 许可使用。
- 游戏内事件页底部显示该事件使用的场景素材与主要许可信息。

## 许可链接

- CC0 1.0：<https://creativecommons.org/publicdomain/zero/1.0/>
- CC BY 3.0：<https://creativecommons.org/licenses/by/3.0/>
- CC BY 4.0：<https://creativecommons.org/licenses/by/4.0/>
- CC BY-SA 3.0：<https://creativecommons.org/licenses/by-sa/3.0/>

## 战斗背景

战斗背景为原创程序化抽象图形，不包含上述照片。场景逻辑位于 `web/game.js` 的 `drawBackground` 与 `drawLocationScenery` 函数。
