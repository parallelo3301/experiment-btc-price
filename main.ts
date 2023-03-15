import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { autorefreshedMs } from "./utils.ts";

interface UsdPrice {
  usd: number;
  usd_24h_change: number;
}

type CoinId = string;

async function fetchPrice(coinId: CoinId): Promise<UsdPrice> {
  const req = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`,
  );
  const data = await req.json();

  const coinData = data && data[coinId]
    ? data[coinId]
    : { usd: 0, usd_24h_change: 0 };
  return coinData;
}

const refreshEveryMinute = autorefreshedMs(60 * 1000);
const btc = refreshEveryMinute({
  initial: <UsdPrice> {
    usd: 0,
    usd_24h_change: 0,
  },
  query: () => fetchPrice("bitcoin"),
});

const port = parseInt(Deno.env.get("PORT") || "8000", 10);
const router = new Router();
const template = await Deno.readTextFile("./index.template.html");

router.get('/', async (ctx) => {
  const currentPriceData: UsdPrice = (await btc).getValue();

  const finalHtml = template
    .replace(/{{usd}}/g, currentPriceData.usd.toLocaleString("en-US")) // toLocaleString not working - https://github.com/denoland/deno/issues/1968
    .replace(/{{usd_24h}}/g, currentPriceData.usd_24h_change.toFixed(2))
    .replace(
      /{{color}}/g,
      currentPriceData.usd_24h_change > 0 ? "green" : "red",
    );

  ctx.response.headers.set("Content-Type", "text/html; charset=utf-8");
  ctx.response.body = finalHtml
});

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port });
