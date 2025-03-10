import { ETHER_DECIMALS_FOR_VIEW } from "../constants";
import Big, { BigNumberValueType, add, divide, multiply, getBigNumber } from "./bignumber";

export const capitalize = function (str: string) {
  if (typeof str !== "string" || !str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const calculateAllocation = (us: Big, tp: Big, tda: Big): Big => {
  let al = us.mul(tda).div(tp);
  return al.round(0, 0);
};

// Consider to migrate this into Class method -->
export const getMinTokenPriceAgainstETH = (
  minRaisedAmount: BigNumberValueType,
  allocatedAmount: BigNumberValueType,
  tokenDecimals: number,
): Big => {
  return divide(
    divide(minRaisedAmount, Big(10).pow(18)),
    divide(allocatedAmount, Big(10).pow(Number(tokenDecimals))),
  );
};
export const getTokenPriceAgainstETH = (
  totalRaised: BigNumberValueType,
  allocatedAmount: BigNumberValueType,
  tokenDecimals: number,
): Big => {
  return divide(
    divide(totalRaised, Big(10).pow(18)),
    divide(allocatedAmount, Big(10).pow(tokenDecimals)),
  );
};
export const getTokenPriceAgainstETHWithMinPrice = (
  minRaisedAmount: BigNumberValueType,
  allocatedAmount: BigNumberValueType,
  totalRaised: BigNumberValueType,
  tokenDecimals: number,
): Big => {
  const minTokenPrice = getMinTokenPriceAgainstETH(minRaisedAmount, allocatedAmount, tokenDecimals);
  const tokenPrice = getTokenPriceAgainstETH(totalRaised, allocatedAmount, tokenDecimals);
  return minTokenPrice.gte(tokenPrice) ? minTokenPrice : tokenPrice;
};
// <--

export const getExpectedAmount = (
  myTotalDonations: BigNumberValueType,
  inputtingValue: BigNumberValueType,
  totalRaised: BigNumberValueType,
  allocatedAmount: BigNumberValueType,
): Big => {
  const donations = add(myTotalDonations, inputtingValue);
  const totalDonations = add(totalRaised, inputtingValue);
  if (totalDonations.lte(Big(0))) {
    return Big(0);
  }
  return calculateAllocation(donations, totalDonations, getBigNumber(allocatedAmount));
};

export const getTargetPercetage = (
  totalRaised: BigNumberValueType,
  maximumTotalRaised: BigNumberValueType,
): number => {
  if (getBigNumber(maximumTotalRaised).lte(Big(0))) {
    return 0;
  }
  return Math.min(100, multiply(divide(totalRaised, maximumTotalRaised), 100).toNumber());
};

export const getFiatConversionAmount = (token: number, fiatRate: number) => {
  return token * fiatRate;
};

export function parseEther(ether: BigNumberValueType): string {
  return multiply(ether, Big(10).pow(18)).toString();
}

export function parseEtherInBig(ether: BigNumberValueType): Big {
  return multiply(ether, Big(10).pow(18));
}

export function formatEther(wei: BigNumberValueType): string {
  return divide(wei, Big(10).pow(18)).toString();
}

export function formatEtherInBig(wei: BigNumberValueType): Big {
  return divide(wei, Big(10).pow(18));
}

export const tokenAmountFormat = (
  amount: BigNumberValueType,
  decimals: number,
  precision: number,
): string => {
  const numerator = Big(10).pow(typeof decimals !== "number" ? parseInt(decimals) : decimals);
  return divide(amount, numerator).toFixed(precision);
};

export const etherAmountFormat = (
  amount: BigNumberValueType,
  precision: number = ETHER_DECIMALS_FOR_VIEW,
  smallValueNotation: boolean = true,
): string => {
  const amountInBig = formatEtherInBig(amount);
  if (smallValueNotation && amountInBig.gt(0) && amountInBig.lt(0.001)) {
    return "< 0.001";
  } else {
    return amountInBig.toFixed(precision);
  }
};

type Countdown = { days: string; hours: string; mins: string; secs: string };

export const getCountdown = (duration: number): Countdown => {
  let restSec = duration;
  const countdown: Countdown = {
    days: "00",
    hours: "00",
    mins: "00",
    secs: "00",
  };
  if (restSec >= 86400) {
    countdown.days = Math.floor(restSec / 86400).toString();
    restSec = restSec % 86400;
  }
  if (restSec >= 3600) {
    countdown.hours = Math.floor(restSec / 3600)
      .toString()
      .padStart(2, "0");
    restSec = restSec % 3600;
  }
  if (restSec >= 60) {
    countdown.mins = Math.floor(restSec / 60)
      .toString()
      .padStart(2, "0");
    restSec = restSec % 60;
  }
  countdown.secs = restSec > 0 ? restSec.toString().padStart(2, "0") : "00";

  return countdown;
};

export const getDomainFromURL = (url: string) => {
  return new URL(url).hostname;
};

export const ellipsisText = (text: string, maxLength: number, ellipsis = "..."): string => {
  return text.length >= maxLength ? text.slice(0, maxLength - ellipsis.length) + ellipsis : text;
};

export const getDecimalsForView = (amount: Big, decimals: number): number => {
  const digits = divide(amount, Big(10).pow(Number(decimals))).toString().length;
  if (digits >= 8) {
    if (decimals >= 2) {
      return 2;
    } else {
      return decimals;
    }
  } else {
    return Math.min(10 - digits, decimals);
  }
};

export const getLinkPath = (path: string, chainId: number): string => {
  const auctionRegex = /^\/auctions\/(\d+)\/(0x[a-fA-F0-9]{40})$/;

  if (path.startsWith("/auctions")) {
    const match = path.match(auctionRegex);
    if (match) {
      // Return the same url when user is on the detail page
      return `/auctions/${match[1]}/${match[2]}`;
    } else {
      return `/auctions/${chainId}`;
    }
  } else if (path.startsWith("/dashboard")) {
    return "/dashboard";
  } else {
    return `?chainId=${chainId}`;
  }
};

export const getRoundedWeekTimestamp = (date?: Date): number => {
  date = date || new Date();
  const WEEK = 3600 * 24 * 7;
  const timestamp = date.getTime();
  return Math.floor(timestamp / 1000 / WEEK) * WEEK * 1000;
};

export const safeParseBigInt = (input: string): bigint => {
  const numericString = input.replace(/[^0-9]/g, "");
  if (numericString === "") return BigInt(0);

  try {
    return BigInt(numericString);
  } catch (error) {
    console.warn(`Could not convert ${input} to BigInt`);
    return BigInt(0);
  }
};

export const toMinUnit = (value: bigint | string, decimals: number) => {
  const str = value.toString();
  const decimalPos = str.indexOf(".");

  let fractionDigits = 0;
  let integerPart = str;
  if (decimalPos >= 0) {
    fractionDigits = str.length - 1 - decimalPos;
    integerPart = str.slice(0, decimalPos) + str.slice(decimalPos + 1);
  }
  let big = safeParseBigInt(integerPart);

  const totalShift = decimals - fractionDigits;
  if (totalShift > 0) {
    big *= 10n ** BigInt(totalShift);
  } else if (totalShift < 0) {
    const diff = BigInt(-totalShift);
    big = big / 10n ** diff;
  }
  return big;
};
