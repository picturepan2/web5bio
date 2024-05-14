export enum ActivityTag {
  collectible = "collectible",
  donation = "donation",
  exchange = "exchange",
  governance = "governance",
  social = "social",
  metaverse = "metaverse",
  transaction = "transaction",
  unknown = "unknown",
}

export enum ActivityType {
  approval = "approval",
  auction = "auction",
  bridge = "bridge",
  burn = "burn",
  claim = "claim",
  comment = "comment",
  delete = "delete",
  deploy = "deploy",
  donate = "donate",
  liquidity = "liquidity",
  loan = "loan",
  mint = "mint",
  multisig = "multisig",
  post = "post",
  profile = "profile",
  propose = "propose",
  proxy = "proxy",
  revise = "revise",
  reward = "reward",
  share = "share",
  staking = "staking",
  swap = "swap",
  trade = "trade",
  transfer = "transfer",
  unknown = "unknown",
  vote = "vote",
}

export const ActivityTypeData: { [key in ActivityType]: ActivityTypeData } = {
  [ActivityType.approval]: {
    key: ActivityType.approval,
    emoji: "✅",
    label: "Approval",
    action: {
      default: "Approved",
      approve: "Approved",
      revoke: "Revoked the approval of",
    },
    prep: "on",
  },
  [ActivityType.auction]: {
    key: ActivityType.auction,
    emoji: "👨‍⚖",
    label: "Auction",
    action: {
      default: "Auctioned",
      buy: "Bought",
      bid: "Placed a bid for",
      finalize: "Finalized a bid for",
    },
    prep: "",
  },
  [ActivityType.bridge]: {
    key: ActivityType.bridge,
    emoji: "🌉",
    label: "Bridge",
    action: {
      default: "Bridged",
      deposit: "Deposited",
      withdraw: "Withdrawn",
    },
    prep: "",
  },
  [ActivityType.burn]: {
    key: ActivityType.burn,
    emoji: "🔥",
    label: "Burn",
    action: {
      default: "Burnt",
    },
    prep: "",
  },
  [ActivityType.claim]: {
    key: ActivityType.claim,
    emoji: "📢",
    label: "Claim",
    action: {
      default: "Claimed",
    },
    prep: "",
  },
  [ActivityType.comment]: {
    key: ActivityType.comment,
    emoji: "💬",
    label: "Comment",
    action: {
      default: "Commented",
    },
    prep: "",
  },
  [ActivityType.delete]: {
    key: ActivityType.delete,
    emoji: "🗑️",
    label: "Delete",
    action: {
      default: "Deleted",
    },
    prep: "",
  },
  [ActivityType.deploy]: {
    key: ActivityType.deploy,
    emoji: "🚀",
    label: "Deploy",
    action: {
      default: "Deployed the contract",
    },
    prep: "",
  },
  [ActivityType.donate]: {
    key: ActivityType.donate,
    emoji: "💌",
    label: "Donate",
    action: {
      default: "Donated",
    },
    prep: "to",
  },
  [ActivityType.liquidity]: {
    key: ActivityType.liquidity,
    emoji: "🏦",
    label: "Liquidity",
    action: {
      default: "Staked",
      add: "Staked",
      remove: "Unstaked",
      withdraw: "Withdrawn",
      supply: "Supplied",
      borrow: "Borrowed",
      repay: "Repaid",
      collect: "Received",
    },
    prep: "",
  },
  [ActivityType.loan]: {
    key: ActivityType.loan,
    emoji: "💸",
    label: "Loan",
    action: {
      default: "Loaned",
    },
    prep: "to",
  },
  [ActivityType.mint]: {
    key: ActivityType.mint,
    emoji: "🖼️",
    label: "Mint",
    action: {
      default: "Minted",
      post: "Minted a post",
    },
    prep: "",
  },
  [ActivityType.multisig]: {
    key: ActivityType.multisig,
    emoji: "✍🏻",
    label: "Multisig",
    action: {
      default: "Signed a multisig transaction",
      execution: "Executed a multisig transaction",
      add_owner: "Added an owner",
      remove_owner: "Removed an owner",
      create: "Created a multisig",
    },
    prep: "",
  },
  [ActivityType.post]: {
    key: ActivityType.post,
    emoji: "📄",
    label: "Post",
    action: {
      default: "Published a post",
    },
    prep: "to",
  },
  [ActivityType.profile]: {
    key: ActivityType.profile,
    emoji: "👤",
    label: "Profile",
    action: {
      default: "",
      delete: "Deleted the record on profile",
      update: "Updated the profile",
      create: "Created the profile",
      renew: "Renewed the domain",
      wrap: "Wrapped the domain",
    },
    prep: "",
  },
  [ActivityType.propose]: {
    key: ActivityType.propose,
    emoji: "📝",
    label: "Propose",
    action: {
      default: "",
    },
    prep: "",
  },
  [ActivityType.proxy]: {
    key: ActivityType.proxy,
    emoji: "🔮",
    label: "Proxy",
    action: {
      default: "",
      appoint: "Approved a proxy",
    },
    prep: "",
  },
  [ActivityType.revise]: {
    key: ActivityType.revise,
    emoji: "✍🏻",
    label: "Revise",
    action: {
      default: "Saved a revision for an article",
    },
    prep: "",
  },
  [ActivityType.reward]: {
    key: ActivityType.reward,
    emoji: "🍬",
    label: "Reward",
    action: {
      default: "Rewarded",
    },
    prep: "",
  },
  [ActivityType.share]: {
    key: ActivityType.share,
    emoji: "🔁",
    label: "Share",
    action: {
      default: "Shared a post",
    },
    prep: "",
  },
  [ActivityType.staking]: {
    key: ActivityType.staking,
    emoji: "🏦",
    label: "Staking",
    action: {
      default: "Staked",
      claim: "Claimed",
      unstake: "Unstaked",
    },
    prep: "",
  },
  [ActivityType.swap]: {
    key: ActivityType.swap,
    emoji: "💵",
    label: "Swap",
    action: {
      default: "Swapped",
    },
    prep: "for",
  },
  [ActivityType.trade]: {
    key: ActivityType.trade,
    emoji: "⚖️",
    label: "Trade",
    action: {
      default: "Traded",
      buy: "Bought",
      sell: "Sold",
      offer: "Made an offer for",
    },
    prep: "",
  },
  [ActivityType.transfer]: {
    key: ActivityType.transfer,
    emoji: "💵",
    label: "Transfer",
    action: {
      default: "Transferred",
      receive: "Received",
    },
    prep: "to",
  },
  [ActivityType.unknown]: {
    key: ActivityType.unknown,
    emoji: "👽",
    label: "Unknown",
    action: {
      default: "Did something unknown",
    },
    prep: "",
  },
  [ActivityType.vote]: {
    key: ActivityType.vote,
    emoji: "🗳️",
    label: "Vote",
    action: {
      default: "Voted",
    },
    prep: "",
  },
};

export interface ActivityTypeData {
  key: string;
  emoji: string;
  label: string;
  action: Object;
  prep: string;
}

export const TagsFilterMapping = {
  ["all"]: {
    label: "All Feeds",
    filters: [],
  },
  ["social"]: {
    label: "Social",
    filters: [ActivityTag.social],
  },
  ["finance"]: {
    label: "Finance",
    filters: [
      ActivityTag.transaction,
      ActivityTag.exchange,
      ActivityTag.governance,
      ActivityTag.donation,
    ],
  },
  ["collectibles"]: {
    label: "Collectibles",
    filters: [ActivityTag.collectible, ActivityTag.metaverse],
  },
};


export const ActivityTypeMapping = (type: ActivityType) => {
  return (
    ActivityTypeData[type] ?? {
      key: type,
      emoji: "",
      label: type,
      action: [],
      prep: "",
    }
  );
};