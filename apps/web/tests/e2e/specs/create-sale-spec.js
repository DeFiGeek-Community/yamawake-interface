// TODO Rewrite with viem after new synpress version released
// https://github.com/cypress-io/cypress/issues/16914#issuecomment-1179996139

// import { mainnet, goerli, sepolia, localhost, Chain } from "viem/chains";
// import { privateKeyToAccount } from "viem/accounts";
// import { getPublicClient, getWalletClient, getToken } from "../../utils";
import { ethers } from "ethers5";
import FactoryABI from "lib/constants/abis/Factory.json";
import TemplateV1ABI from "lib/constants/abis/TemplateV1.json";
import MintableERC20 from "lib/constants/abis/MintableERC20.json";
import Big, { getBigNumber, multiply } from "lib/utils/bignumber";
import { getDecimalsForView, tokenAmountFormat } from "lib/utils";
import { differenceInSeconds, addSeconds, format } from "date-fns";

const TOKEN_AMOUNT = 10;
const MIN_RAISED_AMOUNT = 1;

Cypress.Commands.add("mintToken", () => {
  const token = getToken();
  return new Cypress.Promise((resolve) => {
    token
      .decimals()
      .then((decimals) =>
        token
          .mint(multiply(Big(TOKEN_AMOUNT), Big(10).pow(decimals)).toString())
          .then((res) => resolve(res)),
      );
  });
});

Cypress.Commands.add("revokeApproval", () => {
  const token = getToken();
  return new Cypress.Promise((resolve) => {
    token.approve(Cypress.env("FACTORY_ADDRESS"), 0).then((res) => resolve(res));
  });
});

function getToken() {
  const provider = new ethers.providers.JsonRpcProvider(Cypress.env("PROVIDER_ENDPOINT"));
  const account = new ethers.Wallet(Cypress.env("PRIVATE_KEY"), provider);
  const contract = new ethers.Contract(Cypress.env("AUCTION_TOKEN"), MintableERC20, account);
  return contract;
}

function getFactoryContract() {
  const provider = new ethers.providers.JsonRpcProvider(Cypress.env("PROVIDER_ENDPOINT"));
  const account = new ethers.Wallet(Cypress.env("PRIVATE_KEY"), provider);
  const contract = new ethers.Contract(Cypress.env("FACTORY_ADDRESS"), FactoryABI, account);
  return contract;
}

function getAuctionContract(address) {
  const provider = new ethers.providers.JsonRpcProvider(Cypress.env("PROVIDER_ENDPOINT"));
  const contract = new ethers.Contract(address, TemplateV1ABI, provider);
  return contract;
}

describe("create-auction-spec", () => {
  // 1 day from now
  const start = new Date(new Date().getTime() + 60 * 60 * 24 * 1000);
  // 15 days from now
  const end = new Date(new Date().getTime() + 60 * 60 * 24 * 15 * 1000);

  before(() => {
    cy.revokeApproval();
    cy.mintToken();
    cy.setupMetamask(
      Cypress.env("PRIVATE_KEY"),
      Cypress.env("NETWORK_NAME"),
      Math.random().toString(32).substring(2),
    );
    cy.visit("/");
    cy.get("select.chakra-select").select("en");
  });

  after(() => {
    cy.revokeApproval();
  });

  it("should sign in with Ethereum", () => {
    cy.get("#sign-in-with-ethereum-hero").click();
    cy.get("#metaMask").click();
    cy.acceptMetamaskAccess({ confirmSignatureRequest: true }).then((connected) =>
      cy.get(".chakra-container > h2.chakra-heading").should("have.text", "Dashboard"),
    );
  });

  it("should approve token usage", () => {
    cy.get("button").contains("Create new auction").first().click();
    cy.get("input#token").type(Cypress.env("AUCTION_TOKEN"));

    cy.get('input[name="allocatedAmount"]').clear().type(TOKEN_AMOUNT);
    cy.get('input[name="minRaisedAmount"]').clear().type(MIN_RAISED_AMOUNT);

    cy.get("button")
      .contains("Approve token")
      .first()
      .click()
      .then((res) => {
        // workaround https://github.com/Synthetixio/synpress/issues/795
        cy.wait(10000);

        cy.confirmMetamaskPermissionToSpend(TOKEN_AMOUNT).then((spend) => {
          cy.contains("Transaction sent!");
          cy.contains("Approval confirmed!", { timeout: 60000 });
        });
      });

    cy.wait(1000);
  });

  it("should display identical information on confirmation screen that the user inputs", () => {
    cy.get("input.rs-picker-toggle-textbox").click();
    const options = { year: "numeric", month: "short" };
    const startString = `${start.getDate().toString().padStart(2, "0")} ${start.toLocaleDateString(
      "en-US",
      options,
    )}`;
    const endString = `${end.getDate().toString().padStart(2, "0")} ${end.toLocaleDateString(
      "en-US",
      options,
    )}`;

    cy.get('body').then((body) => {
      if (body.find(`[aria-label="${startString}"]`).length === 0) {
        cy.get(`[aria-label="Previous month"]`).first().click();
      }
      cy.get(`[aria-label="${startString}"]`).first().click();

      if (body.find(`[aria-label="${endString}"]`).length === 0) {
        cy.get(`[aria-label="Next month"]`).first().click();
      }
      cy.get(`[aria-label="${endString}"]`).first().click();
    
      // const timeButton1 = cy.get('div[index="0"] .rs-calendar-header-title.rs-calendar-header-title-time.rs-btn.rs-btn-subtle.rs-btn-xs')
      cy.get(
        'div[index="0"] .rs-calendar-header-title.rs-calendar-header-title-time.rs-btn.rs-btn-subtle.rs-btn-xs',
      ).click();
      cy.get(`div[index="0"] [data-key="hours-5"]`).click();
      cy.get(`div[index="0"] [data-key="minutes-10"]`).click();
      cy.get(`div[index="0"] [data-key="seconds-0"]`).click();
      cy.get(
        'div[index="0"] .rs-calendar-header-title.rs-calendar-header-title-time.rs-btn.rs-btn-subtle.rs-btn-xs',
      ).click();
      // cy.wait(1000)
      // const timeButton2 = cy.get('div[index="1"] .rs-calendar-header-title.rs-calendar-header-title-time.rs-btn.rs-btn-subtle.rs-btn-xs')
      cy.get(
        'div[index="1"] .rs-calendar-header-title.rs-calendar-header-title-time.rs-btn.rs-btn-subtle.rs-btn-xs',
      ).click();
      cy.get(`div[index="1"] [data-key="hours-15"]`).click();
      cy.get(`div[index="1"] [data-key="minutes-43"]`).click();
      cy.get(`div[index="1"] [data-key="seconds-0"]`).click();
      cy.get(
        'div[index="1"] .rs-calendar-header-title.rs-calendar-header-title-time.rs-btn.rs-btn-subtle.rs-btn-xs',
      ).click();

      cy.get(".rs-picker-toolbar-right > button").contains("OK").first().click();

      cy.get("button")
        .contains("Deploy Auction Contract")
        .first()
        .click()
        .then(() => {
          const token = getToken();
          Cypress.Promise.all([token.totalSupply(), token.decimals(), token.symbol()]).then(
            ([totalSupply, decimals, symbol]) => {
              const tokenAmountWithFormat = tokenAmountFormat(
                multiply(Big(TOKEN_AMOUNT), Big(10).pow(decimals)),
                decimals,
                getDecimalsForView(getBigNumber(totalSupply.toString()), decimals),
              );
              cy.get('p[aria-label="Allocated to the auction"]')
                .should("have.text", `${tokenAmountWithFormat} ${symbol}`)
                .then(() => {
                  cy.get('p[aria-label="Auction Template"]').should("have.text", "TemplateV1");
                  cy.get('p[aria-label="Token address"]').should(
                    "have.text",
                    Cypress.env("AUCTION_TOKEN"),
                  );
                  cy.get('p[aria-label="Start date - End date"]').should(
                    "have.text",
                    `${format(start, "yyyy/MM/dd ")}05:10:00 - ${format(
                      end,
                      "yyyy/MM/dd ",
                    )}15:43:00${" "}${format(new Date(), "(z)")}`,
                  );
                  cy.get('p[aria-label="Minimum total raised"]').should("have.text", "1.00 ETH");
                });
            },
          );
        });
      cy.wait(5000);
    });
  });

  it("should send and confirm the transaction successfully", () => {
    cy.get('button[type="submit"]')
      .contains("Deploy Auction Contract")
      .first()
      .click();
    cy.wait(10000);
    cy.confirmMetamaskTransaction();
    cy.contains("Transaction sent!");
    cy.get('input#id').should('not.have.value', "");
  });

  it("should have the same parameters as user's input", () => {
    cy.get("input#id")
      .invoke("val")
      .then((contractAddress) => {
        cy.log(contractAddress)
        const auction = getAuctionContract(contractAddress);
        Cypress.Promise.all([
          auction.owner(),
          auction.startingAt(),
          auction.closingAt(),
          auction.erc20onsale(),
          auction.allocatedAmount(),
          auction.minRaisedAmount(),
        ]).then(([owner, startingAt, closingAt, erc20onsale, allocatedAmount, minRaisedAmount]) => {
          const token = getToken();
          token.decimals().then((decimals) => {
            expect(allocatedAmount.toString()).to.eq(multiply(TOKEN_AMOUNT, Big(10).pow(decimals)).toString());
            expect(minRaisedAmount.toString()).to.eq(multiply(MIN_RAISED_AMOUNT, Big(10).pow(decimals)).toString());
          });
          cy.getMetamaskWalletAddress().then(()=>{
            expect(owner).to.eq(address)
            expect(startingAt).to.eq(start.getTime() / 1000);
            expect(closingAt).to.eq(end.getTime() / 1000);
            expect(erc20onsale).to.eq(Cypress.env("AUCTION_TOKEN"));
          });
        });
      });
  });
});
