# jike-tool

即刻工具箱

## Features

- 获取用户所有动态下点赞者列表（点赞排行榜）

## Usage

```bash
pnpm i
pnpm start -- -t <token> -u <username>
```

- token: 登录 https://web.okjike.com/，在 Cookies 中找到 `x-jike-access-token`；
- username: 进入用户页，查看源代码，找到 `https://web.okjike.com/u/` 后面的 ID
