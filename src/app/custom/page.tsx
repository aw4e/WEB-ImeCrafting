"use client";

import { useState, useEffect } from "react";
import miningData from "@/data/mining.json";
import { MiningData } from "@/types";
import Navigation from "@/app/components/navigation";
import BackgroundGrid from "../components/backgroundGrid";

export default function PriceEditorPage() {
  const [data, setData] = useState<MiningData>(miningData as MiningData);

  // Load saved prices
  useEffect(() => {
    const saved = localStorage.getItem("customPrices");
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  // Save changes
  const saveData = (newData: MiningData) => {
    setData(newData);
    localStorage.setItem("customPrices", JSON.stringify(newData));
  };

  const handlePriceChange = (
    category: "tambang" | "perhiasan",
    item: string,
    value: number
  ) => {
    const updated = {
      ...data,
      [category]: {
        ...data[category],
        [item]: {
          ...data[category][item],
          price: value,
        },
      },
    };

    saveData(updated);
  };

  const resetPrices = () => {
    localStorage.removeItem("customPrices");
    setData(miningData as MiningData);
  };

  const formatName = (name: string) =>
    name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const renderItems = (category: "tambang" | "perhiasan") => {
    return Object.entries(data[category]).map(([name, item]) => (
      <div
        key={name}
        className="flex justify-between items-center bg-gradient-to-r from-gray-800/90 to-gray-900/90 border border-gray-600 p-4 rounded-xl shadow-md hover:shadow-lg hover:border-green-500/40 transition-all duration-200 backdrop-blur-sm"
      >
        <span className="text-white font-semibold tracking-wide">
          {formatName(name)}
        </span>

        <input
          type="number"
          value={item.price}
          onChange={(e) =>
            handlePriceChange(category, name, Number(e.target.value))
          }
          className="w-32 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white font-semibold text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
        />
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative">
      {/* Background */}
      <BackgroundGrid />

      {/* Header */}
      <header className="relative z-10 pt-10 pb-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Custom Mining Price
            </span>
          </h1>

          <p className="text-lg text-gray-300">
            Editor Harga Tambang dan Perhiasan IMERP
          </p>

          <p className="text-sm text-gray-400 mt-2">
            Atur harga sesuai kebutuhan untuk optimasi profit crafting. 
          </p>
        </div>
      </header>

      <Navigation />

      {/* Content */}
      <main className="relative z-10 max-w-5xl mx-auto p-6">
        <h2 className="text-4xl font-bold mb-8 text-white">
          Edit Harga Item
        </h2>

        {/* Tambang */}
        <section className="mb-12">
          <h3 className="text-3xl font-semibold mb-4 text-green-400">
            Tambang
          </h3>

          <div className="space-y-3">
            {renderItems("tambang")}
          </div>
        </section>

        {/* Perhiasan */}
        <section className="mb-12">
          <h3 className="text-3xl font-semibold mb-4 text-blue-400">
            Perhiasan
          </h3>

          <div className="space-y-3">
            {renderItems("perhiasan")}
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() =>
              localStorage.setItem("customPrices", JSON.stringify(data))
            }
            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold shadow-md hover:shadow-green-500/30 transition-all"
          >
            Save
          </button>

          <button
            onClick={resetPrices}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold shadow-md hover:shadow-red-500/30 transition-all"
          >
            Reset
          </button>
        </div>
      </main>
    </div>
  );
}