
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';

export const PieChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let cumulativePercent = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 32 32" className="w-full h-full -rotate-90">
          {data.map((item, i) => {
            const percentage = (item.value / total) * 100;
            const strokeDasharray = `${percentage} ${100 - percentage}`;
            const strokeDashoffset = -cumulativePercent;
            cumulativePercent += percentage;
            
            return (
              <circle
                key={i}
                cx="16" cy="16" r="15.915"
                fill="transparent"
                stroke={item.color}
                strokeWidth="3"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{total}</span>
          <span className="text-[10px] uppercase text-slate-400 font-bold">Total</span>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs font-medium">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
            <span className="text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const BarGraph = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-4 w-full">
      {data.map((item, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-600">{item.label}</span>
            <span className="text-slate-900">{item.value}</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / maxValue) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: item.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
