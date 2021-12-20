# post-calendar

动态日历

## Usage

```bash
pnpm i && cd packages/post-calendar
pnpm dev -- -t <token> -u <username>
```

- token: 登录 https://web.okjike.com/ ，在 Cookies 中找到 `x-jike-access-token`；
- username: 进入用户页，查看源代码，找到 `https://web.okjike.com/u/` 后面的 ID
