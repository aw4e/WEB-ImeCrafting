import { NextRequest, NextResponse } from "next/server";
import miningData from "@/data/mining.json";
import {
  ApiRequest,
  Inventory,
  MiningData,
  OptimizationResult,
  OptimizedStep,
  SellableItem,
} from "@/types";

/**
 * Merge default data with custom prices (from client)
 */
function mergePrices(
  base: MiningData,
  custom?: MiningData
): MiningData {
  if (!custom) return base;

  return {
    tambang: {
      ...base.tambang,
      ...Object.fromEntries(
        Object.entries(custom.tambang || {}).map(([k, v]) => [
          k,
          { ...base.tambang[k], ...v },
        ])
      ),
    },
    perhiasan: {
      ...base.perhiasan,
      ...Object.fromEntries(
        Object.entries(custom.perhiasan || {}).map(([k, v]) => [
          k,
          { ...base.perhiasan[k], ...v },
        ])
      ),
    },
  };
}

/**
 * Format helpers
 */
const fmt = (name: string): string =>
  name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

const time = (s: number): string => {
  if (s === 0) return "0s";

  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  return [
    h > 0 ? `${h}h` : "",
    m > 0 ? `${m}m` : "",
    sec > 0 ? `${sec}s` : "",
  ]
    .filter(Boolean)
    .join(" ");
};

/**
 * MAIN OPTIMIZER
 */
function optimizeWithDependencies(
  inventory: Inventory,
  miningData: MiningData
): OptimizationResult {
  const allItems = { ...miningData.tambang, ...miningData.perhiasan };
  const inv = { ...inventory };

  const productionSteps: OptimizedStep[] = [];
  const sellableItems: SellableItem[] = [];

  let totalProfit = 0;
  const totalTime = 0;

  for (const [itemName, qty] of Object.entries(inv)) {
    const item = allItems[itemName];
    if (!item || qty <= 0) continue;

    const value = item.price * qty;

    sellableItems.push({
      name: fmt(itemName),
      quantity: qty,
      price: item.price,
      value,
    });

    totalProfit += value;
  }

  return {
    success: true,
    data: {
      summary: {
        totalProfit,
        totalSellValue: totalProfit,
        totalTime,
        totalTimeFormatted: time(totalTime),
      },
      sellableItems,
      productionSteps,
    },
  };
}

/**
 * API HANDLER
 */
export async function POST(request: NextRequest) {
  try {
    const body: ApiRequest & { customPrices?: MiningData } =
      await request.json();

    if (!body.inventory) {
      return NextResponse.json(
        { success: false, error: "Invalid inventory" },
        { status: 400 }
      );
    }

    // 🔥 Merge custom prices
    const mergedData = mergePrices(miningData as MiningData, body.customPrices);

    const result = optimizeWithDependencies(
      body.inventory,
      mergedData
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}