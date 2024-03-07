export const CHAINLINK_PRICE_FEED: { [key: string]: { [key: number]: `0x${string}` } } = {
  "ETH-USD": {
    1: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    5: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    11155111: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
};

export const ETHER_DECIMALS_FOR_VIEW = 3;

export const URL_REGEX = new RegExp(
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
);

export const SAMPLE_DISCLAIMERS = `By participating in this token auction event, you acknowledge and agree to the following terms:

1. The use of this protocol is subject to jurisdictional requirements, and you understand and accept that engaging with this protocol may have legal implications based on your local laws and regulations. You are solely responsible for complying with applicable laws and regulations.
2. This protocol is provided on an ""as-is"" basis, without any warranties or guarantees of any kind, whether expressed or implied. It is your responsibility to assess the risks involved and make an informed decision about participating in this token auction event.
3. This protocol is not intended to comply with specific laws and regulations of any jurisdiction. It is your responsibility to understand and comply with the relevant laws and regulations applicable to you.
4. The operation of this protocol is standardized for all users, and no special privileges or advantages are provided to any individual or entity. The protocol operates based on its predetermined rules in codes.
5. In the event of any bugs, defects, or malfunctions in the protocol, no party, including the protocol developers, organizers, or any associated individuals or entities, shall be held liable for any losses, damages, or issues arising from such incidents. You understand that the protocol is a complex system, and there is inherent risk in using it.`;
