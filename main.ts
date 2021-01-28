import { serve } from "https://deno.land/std/http/server.ts";
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

const port = parseInt(Deno.env.get("PORT") || "8000", 10);
const server = serve({ port });

async function main() {
  const refreshEveryMinute = autorefreshedMs(60 * 1000);

  const btc = refreshEveryMinute({
    initial: <UsdPrice> {
      usd: 0,
      usd_24h_change: 0,
    },
    query: () => fetchPrice("bitcoin"),
  });

  const template = await Deno.readTextFile("./index.template.html");

  for await (const req of server) {
    const currentPriceData: UsdPrice = (await btc).getValue();

    const finalHtml = template
      .replace("{{usd}}", currentPriceData.usd.toLocaleString("en-US")) // toLocaleString not working - https://github.com/denoland/deno/issues/1968
      .replace("{{usd_24h}}", currentPriceData.usd_24h_change.toFixed(2))
      .replace(
        "{{color}}",
        currentPriceData.usd_24h_change > 0 ? "green" : "red",
      );

    const headers = new Headers({ "Content-Type": "text/html; charset=utf-8" });
    req.respond({ status: 200, body: finalHtml, headers });
  }
}

main();
