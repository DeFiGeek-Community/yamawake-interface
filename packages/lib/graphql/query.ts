import { gql } from "graphql-request";

export enum QueryType {
  ACTIVE_AND_UPCOMING,
  ACTIVE,
  UPCOMING,
  CLOSED,
  MY_SALE_QUERY,
  PARTICIPATED_SALE_QUERY,
}

export const LIST_ACTIVE_AND_UPCOMING_SALE_QUERY = gql`
  query ListAuctions($skip: Int! = 0, $first: Int! = 50, $now: Int!) {
    auctions(
      orderBy: startingAt
      orderDirection: desc
      skip: $skip
      first: $first
      where: { closingAt_gt: $now }
    ) {
      id
      templateAuctionMap {
        id
        templateName
      }
      owner
      startingAt
      closingAt
      args
      auctionToken {
        id
        name
        symbol
        decimals
      }
      raisedTokens {
        id
        name
        symbol
        decimals
      }
      totalRaised {
        id
        amount
        token {
          id
          name
          symbol
          decimals
        }
      }
      blockNumber
    }
  }
`;

export const LIST_ACTIVE_SALE_QUERY = gql`
  query ListAuctions($skip: Int! = 0, $first: Int! = 50, $now: Int!) {
    auctions(
      orderBy: startingAt
      orderDirection: desc
      skip: $skip
      first: $first
      where: { startingAt_lte: $now, closingAt_gt: $now }
    ) {
      id
      templateAuctionMap {
        id
        templateName
      }
      owner
      startingAt
      closingAt
      args
      auctionToken {
        id
        name
        symbol
        decimals
      }
      raisedTokens {
        id
        name
        symbol
        decimals
      }
      totalRaised {
        id
        amount
        token {
          id
          name
          symbol
          decimals
        }
      }
      blockNumber
    }
  }
`;

export const LIST_UPCOMING_SALE_QUERY = gql`
  query ListAuctions($skip: Int! = 0, $first: Int! = 50, $now: Int!) {
    auctions(
      orderBy: startingAt
      orderDirection: desc
      skip: $skip
      first: $first
      where: { startingAt_gt: $now }
    ) {
      id
      templateAuctionMap {
        id
        templateName
      }
      owner
      startingAt
      closingAt
      args
      auctionToken {
        id
        name
        symbol
        decimals
      }
      raisedTokens {
        id
        name
        symbol
        decimals
      }
      totalRaised {
        id
        amount
        token {
          id
          name
          symbol
          decimals
        }
      }
      blockNumber
    }
  }
`;

export const LIST_CLOSED_SALE_QUERY = gql`
  query ListAuctions($skip: Int! = 0, $first: Int! = 50, $now: Int!) {
    auctions(
      orderBy: startingAt
      orderDirection: desc
      skip: $skip
      first: $first
      where: { closingAt_lt: $now }
    ) {
      id
      templateAuctionMap {
        id
        templateName
      }
      owner
      startingAt
      closingAt
      args
      auctionToken {
        id
        name
        symbol
        decimals
      }
      raisedTokens {
        id
        name
        symbol
        decimals
      }
      totalRaised {
        id
        amount
        token {
          id
          name
          symbol
          decimals
        }
      }
      blockNumber
    }
  }
`;

export const LIST_MY_SALE_QUERY = gql`
  query MyAuctions($skip: Int! = 0, $first: Int! = 50, $id: ID!) {
    auctions(
      orderBy: startingAt
      orderDirection: desc
      skip: $skip
      first: $first
      where: { owner: $id }
    ) {
      id
      templateAuctionMap {
        id
        templateName
      }
      owner
      startingAt
      closingAt
      args
      auctionToken {
        id
        name
        symbol
        decimals
      }
      raisedTokens {
        id
        name
        symbol
        decimals
      }
      totalRaised {
        id
        amount
        token {
          id
          name
          symbol
          decimals
        }
      }
      blockNumber
    }
  }
`;

export const LIST_PARTICIPATED_SALE_QUERY = gql`
  query ParticipatedAuctions($skip: Int! = 0, $first: Int! = 50, $id: ID!) {
    auctions(
      orderBy: startingAt
      orderDirection: desc
      skip: $skip
      first: $first
      where: { contributions_: { from: $id } }
    ) {
      id
      templateAuctionMap {
        id
        templateName
      }
      owner
      startingAt
      closingAt
      args
      auctionToken {
        id
        name
        symbol
        decimals
      }
      raisedTokens {
        id
        name
        symbol
        decimals
      }
      totalRaised {
        id
        amount
        token {
          id
          name
          symbol
          decimals
        }
      }
      blockNumber
    }
  }
`;

export const GET_SALE_QUERY = gql`
  query GetAuction($id: ID!, $address: String!) {
    auction(id: $id) {
      id
      templateAuctionMap {
        id
        templateName
      }
      owner
      startingAt
      closingAt
      args
      auctionToken {
        id
        name
        symbol
        decimals
      }
      raisedTokens {
        id
        name
        symbol
        decimals
      }
      totalRaised {
        id
        amount
        token {
          id
          name
          symbol
          decimals
        }
      }
      contributions(last: 1000) {
        id
        amount
        from
        raisedToken {
          name
          symbol
          decimals
        }
        totalRaised
        receivedAt
        blockNumber
      }
      claims(where: { participant: $address }) {
        id
      }
      blockNumber
    }
  }
`;

export const LIST_TEMPLATE_QUERY = gql`
  query ListTemplates {
    templates(orderBy: addedAt) {
      id
      templateName
      addedAt
    }
  }
`;
