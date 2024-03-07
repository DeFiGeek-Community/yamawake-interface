import { AbiCoder } from "ethers";
import { URL_REGEX } from "../../constants";

export abstract class BaseAuction implements AuctionProps {
  id?: string;
  templateAuctionMap: TemplateAuctionMap;
  auctionToken: Token;
  owner: `0x${string}`;
  args: string;
  startingAt: number; //Timestamp
  closingAt: number; //Timestamp
  totalRaised: TotalRaised[];
  contributions: Contribution[];
  claims: Claim[];
  blockNumber: string; // Deployed block number

  // Decode this.args and set attributes as needed
  abstract parseArgs(): void;

  constructor(data: AuctionProps) {
    this.id = data.id ? data.id : undefined;
    this.templateAuctionMap = data.templateAuctionMap;
    this.auctionToken = data.auctionToken;
    this.owner = data.owner;
    this.args = data.args;
    this.startingAt = data.startingAt;
    this.closingAt = data.closingAt;
    this.totalRaised = data.totalRaised;
    this.contributions = data.contributions;
    this.claims = data.claims;
    this.blockNumber = data.blockNumber;
  }
}

export class TemplateV1 extends BaseAuction {
  allocatedAmount: string;
  minRaisedAmount: string;
  parseArgs(): { allocatedAmount: string; minRaisedAmount: string } {
    const params = AbiCoder.defaultAbiCoder().decode(["uint256", "uint256"], this.args);
    return { allocatedAmount: params[0], minRaisedAmount: params[1] };
  }
  constructor(data: AuctionProps) {
    super(data);
    const decodedArgs = this.parseArgs();
    this.allocatedAmount = decodedArgs.allocatedAmount;
    this.minRaisedAmount = decodedArgs.minRaisedAmount;
  }
}

export type AuctionProps = {
  id?: string;
  templateAuctionMap: TemplateAuctionMap;
  auctionToken: Token;
  // token: `0x${string}` | null;
  // tokenName: string;
  // tokenSymbol: string;
  // tokenDecimals: string;
  owner: `0x${string}`;
  args: string;
  // allocatedAmount: string;
  // minRaisedAmount: string;
  startingAt: number; //Timestamp
  closingAt: number; //Timestamp
  // lockDuration?: number; //In sec
  // expirationDuration?: number; //In sec
  // feeRatePerMil?: number;
  totalRaised: TotalRaised[];
  contributions: Contribution[];
  claims: Claim[];
  blockNumber: string; // Deployed block number
};

export type Template = {
  id: `0x${string}`;
  templateName: `0x${string}`;
  addedAt: string; //Timestamp
};

export type TemplateAuctionMap = {
  id: `0x${string}`;
  templateName: `0x${string}`;
};

export type Token = {
  id: `0x${string}`;
  name: string;
  symbol: string;
  decimals: string;
};

export type TotalRaised = {
  id: string;
  amount: string;
  token: Token;
};

export type Contribution = {
  id: string;
  amount: string;
  from: `0x${string}`;
  receivedAt: number;
  totalRaised: string;
  blockNumber: string;
};

export type Claim = {
  id: string;
  participant: `0x${string}`;
  recipient: `0x${string}`;
  userShare: string;
  erc20allocation: string;
  claimedAt: string;
  blockNumber: string;
};

export type AuctionForm = {
  templateName: string;
  token: `0x${string}` | null;
  owner: `0x${string}`;
  allocatedAmount: number;
  startingAt: number; //Timestamp
  eventDuration: number; //Timestamp
  minRaisedAmount: number;
};

export type MetaData = {
  id?: string;
  title?: string;
  description?: string;
  terms?: string;
  projectURL?: string;
  logoURL?: string;
  otherURL?: string;
  targetTotalRaised?: number;
  maximumTotalRaised?: number;
  templateName?: string;
  createdAt?: number;
};

export const validateMetaData = (metaData: MetaData, minRaisedAmount?: number) => {
  const errors: any = {};
  if (!metaData.id) {
    errors.id = "Contract address is required";
  }
  if (metaData.title && metaData.title.length > 100) {
    errors.title = "Max length is 100";
  }
  if (metaData.description && metaData.description.length > 1000) {
    errors.description = "Max length is 1000";
  }
  if (metaData.terms && metaData.terms.length > 2000) {
    errors.terms = "Max length is 2000";
  }
  if (
    metaData.targetTotalRaised &&
    (!metaData.maximumTotalRaised ||
      Number(metaData.targetTotalRaised) > Number(metaData.maximumTotalRaised))
  ) {
    errors.maximumTotalRaised = "Maximum total raised must be bigger than Target total raised";
  }
  if (metaData.projectURL && !URL_REGEX.test(metaData.projectURL)) {
    errors.projectURL = "Invalid URL format";
  }
  if (metaData.logoURL && !URL_REGEX.test(metaData.logoURL)) {
    errors.logoURL = "Invalid URL format";
  }
  if (metaData.otherURL && !URL_REGEX.test(metaData.otherURL)) {
    errors.otherURL = "Invalid URL format";
  }
  if (
    minRaisedAmount &&
    metaData.targetTotalRaised &&
    Number(minRaisedAmount) > Number(metaData.targetTotalRaised)
  ) {
    errors.targetTotalRaised = `Target total raised must be bigger than or equal to Minimum total raised (${minRaisedAmount} ETH)`;
  }
  return errors;
};
