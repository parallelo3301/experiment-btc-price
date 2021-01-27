# BTC price

Simple [Deno](https://deno.land/) experiment. Deployed at [https://btc.parallelo3301.org](https://btc.parallelo3301.org).


## Notes

Default port: `8000`

Deno
- ICU not working (toLocaleString) - https://github.com/denoland/deno/issues/1968
- test permissions model
- test app compiling
- test single file deployments (aka running the executable)


## Build

```
LINUX
$ deno compile --unstable --allow-env=PORT --allow-net=0.0.0.0,api.coingecko.com --allow-read=index.template.html -o btc main.ts 

WINDOWS
$> deno compile --unstable --allow-env=PORT --allow-net=0.0.0.0,api.coingecko.com --allow-read=index.template.html -o btc.exe main.ts
```


## Run
```
BUILDED APP

LINUX
$ PORT=5000 ./btc

WINDOWS (PowerShell)
$> $env:PORT=5000; .\btc.exe
$> Remove-Item Env:\PORT

---

FROM SOURCES
$ deno run --allow-env=PORT --allow-net=0.0.0.0,api.coingecko.com --allow-read=index.template.html main.ts 
```
