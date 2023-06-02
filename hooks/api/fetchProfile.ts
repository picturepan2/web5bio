import { SIMPLE_HASH_URL } from "../../components/apis/simplehash";
import { NFT_PAGE_SIZE } from "../../components/profile/NFTCollectionWidget";
import { PlatformType } from "../../utils/platform";

const resolveSearchHandle = (identity) => {
  return {
    [PlatformType.ethereum]: identity.displayName || identity.identity,
    [PlatformType.twitter]: identity.identity,
    [PlatformType.farcaster]: identity.identity,
    [PlatformType.lens]: identity.identity,
  }[identity.platform];
};
export const fetchProfile = async (identity) => {
  try {
    const handle = resolveSearchHandle(identity);
    if (!handle) return null;

    const platform =
      identity.platform === PlatformType.ethereum
        ? PlatformType.ens
        : identity.platform;
    const url =
      process.env.NEXT_PUBLIC_PROFILE_END_POINT +
      `/profile/${platform.toLowerCase()}/${handle}`;
    const res = await fetch(url, { next: { revalidate: 600 } });
    return await res.json();
  } catch (e) {
    return null;
  }
};

export const fetchInitialNFTsData = async (address) => {
  try {
    const res = await fetch(
      SIMPLE_HASH_URL +
        `/api/v0/nfts/owners?chains=ethereum&wallet_addresses=${address}&limit=${NFT_PAGE_SIZE}`
    );
    return res.json();
  } catch (e) {
    return [];
  }
};
