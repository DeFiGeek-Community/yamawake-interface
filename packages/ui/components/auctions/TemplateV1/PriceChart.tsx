import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  TimeScale,
  ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-moment";
import { TemplateV1 } from "lib/types/Auction";
import { useEffect, useState } from "react";
import { getMinTokenPriceAgainstETH, getTokenPriceAgainstETHWithMinPrice } from "lib/utils";

ChartJS.register(
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  TimeScale,
  Filler,
  Title,
  Tooltip,
  Legend,
);

export default function PriceChart({ auction }: { auction: TemplateV1 }) {
  const [options, setOptions] = useState({});
  let defaultData = {
    datasets: [
      {
        data: [],
        fill: false,
        pointRadius: 0,
        showLine: false,
        borderDash: [5, 5],
        pointBackgroundColor: "rgb(0, 0, 0, 0.8)",
        borderColor: "rgb(0, 0, 0, 0.6)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        data: [],
        fill: true,
        pointRadius: 2,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  const [data, setData] = useState<
    ChartData<
      "line",
      {
        x: number;
        y: number;
      }[],
      unknown
    >
  >(defaultData);

  useEffect(() => {
    const newData = auction.contributions.map((contribution) => {
      return {
        x: contribution.receivedAt * 1000,
        y: getTokenPriceAgainstETHWithMinPrice(
          auction.minRaisedAmount,
          auction.allocatedAmount,
          contribution.totalRaised,
          Number(auction.auctionToken.decimals),
        ).toNumber(),
      };
    });
    // Price at the auction start
    newData.unshift({
      x: auction.startingAt * 1000,
      y: getMinTokenPriceAgainstETH(
        auction.minRaisedAmount,
        auction.allocatedAmount,
        Number(auction.auctionToken.decimals),
      ).toNumber(),
    });
    // Price now
    const now = new Date().getTime();
    newData.push({
      x: now > auction.closingAt * 1000 ? auction.closingAt * 1000 : now,
      y: getTokenPriceAgainstETHWithMinPrice(
        auction.minRaisedAmount,
        auction.allocatedAmount,
        auction.totalRaised[0].amount,
        Number(auction.auctionToken.decimals),
      ).toNumber(),
    });
    newData.sort((a, b) => a.x - b.x);
    setOptions({
      responsive: true,
      plugins: {
        legend: {
          display: false,
          position: "top" as const,
        },
        title: {
          display: true,
          text: `1 ${auction.auctionToken.symbol.toUpperCase()} = ${getTokenPriceAgainstETHWithMinPrice(
            auction.minRaisedAmount,
            auction.allocatedAmount,
            auction.totalRaised[0].amount,
            Number(auction.auctionToken.decimals),
          ).toFixed(8)} ETH`,
          font: { weight: "bold", size: 18 },
          color: "white",
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              return `${context.raw.y.toFixed(8)} ETH`;
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          type: "time" as const,
          time: {
            unit: "day" as const,
            displayFormats: {
              day: "YYYY/MM/DD",
            },
          },
          // min: new Date(auction.startingAt * 1000).getTime(),
          max: new Date(auction.closingAt * 1000).getTime(),
          ticks: {
            autoSkip: true,
            maxTicksLimit: 5,
          },
        },
        y: {
          position: "right" as const,
          // min: getMinTokenPriceAgainstETH(auction.minRaisedAmount, auction.allocatedAmount, auction.tokenDecimals).toNumber(),
          // max: getTokenPriceAgainstETHWithMinPrice(auction.minRaisedAmount, auction.allocatedAmount, auction.totalRaised, auction.tokenDecimals).times(1.2).toNumber(),
          ticks: {
            callback: function (value: string | number) {
              return `${Number(value).toFixed(8)}`;
            },
          },
        },
      },
    });
    setData({
      datasets: [
        {
          data: [],
          fill: false,
          pointRadius: 0,
          showLine: false,
          borderDash: [5, 5],
          pointBackgroundColor: "rgb(0, 0, 0, 0.8)",
          borderColor: "rgb(0, 0, 0, 0.6)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
        {
          data: newData,
          fill: true,
          pointRadius: 2,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
      ],
    });
  }, [auction.contributions]);

  return <Line options={options} data={data} />;
}
