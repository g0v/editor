# Metadata Editor

線上 JSON Editor，可透過 GET 參數預先填入初始值。Github 登入後可自動發 Fork + create Pull Request

## Example

前往

```
https://g0v.github.io/editor/?repo=g0v/datasmith&name=datasmith&name_zh=資料新聞產生器
```

便可得到包含預先填好的表單的編輯器。

若是 target repo 已經包含 g0v.json，則會用該 g0v.json 中的值預先填入編輯器中。

## Development

`yarn.lock` is in the source tree. Run `yarn install` to ensure your dependencies are identical with locked versions.

## Test

Jest and Enzyme are configured to run tests against React components.

Put test files in `__test__/` and run it with `yarn test`

## TODO

See metadata-editor at https://waffle.io/g0v/awesome-g0v
