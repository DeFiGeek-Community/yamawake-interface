import { mainnet, sepolia, arbitrum, hardhat } from "viem/chains";

type DynamodbTables = {
  readonly [key: number]: string;
};

export const DYNAMODB_TABLES: DynamodbTables = {
  [mainnet.id]: process.env[`_AWS_DYNAMO_TABLE_NAME_MAINNET`]!,
  [arbitrum.id]: process.env[`_AWS_DYNAMO_TABLE_NAME_ARBITRUM`]!,
  [sepolia.id]: process.env[`_AWS_DYNAMO_TABLE_NAME_SEPOLIA`]!,
  [hardhat.id]: process.env[`_AWS_DYNAMO_TABLE_NAME_HARDHAT`]!,
};
