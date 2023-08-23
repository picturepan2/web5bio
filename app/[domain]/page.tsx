import { fetchInitialNFTsData } from "../../hooks/api/fetchProfile";
import { PlatformType, SocialPlatformMapping } from "../../utils/platform";
import { handleSearchPlatform, mapLinks } from "../../utils/utils";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProfileMain from "../../components/profile/ProfileMain";

function mapNFTs(nfts) {
  if (!nfts) return [];
  return nfts.map((x) => ({
    image_url: x.image_url,
    previews: x.previews,
    token_id: x.token_id,
    collection: {
      address: x.contract_address,
      collection_id: x.collection.collection_id,
      description: x.collection.description,
      name: x.collection.name,
      image_url: x.collection.image_url,
    },
    video_url: x.video_url,
    audio_url: x.audio_url,
    video_properties: x.video_properties,
    image_properties: x.image_properties,
    extra_metadata: x.extra_metadata,
  }));
}

async function fetchDataFromServer(domain: string) {
  if (!domain) notFound();
  try {
    const platform = handleSearchPlatform(domain);
    if (
      ![
        PlatformType.ens,
        PlatformType.farcaster,
        PlatformType.lens,
        PlatformType.ethereum,
        PlatformType.nextid,
      ].includes(platform)
    )
      notFound();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PROFILE_END_POINT}/profile/${domain}`
    );
    if (response.status === 404) notFound();
    const raw = await response.json();
    const relations = Array.from(
      raw?.map((x) => ({ platform: x.platform, identity: x.identity }))
    );
    const _data = raw.find((x) => x.platform === platform) || raw?.[0];
    if (!_data || _data.error) throw new Error(_data.error);
    const remoteNFTs = _data.address
      ? await fetchInitialNFTsData(_data.address)
      : {};
    return {
      data: { ..._data, links: mapLinks(raw) },
      nfts: { ...remoteNFTs, nfts: mapNFTs(remoteNFTs?.nfts) },
      platform,
      relations,
    };
  } catch (e) {
    notFound();
  }
}

export async function generateMetadata({
  params: { domain },
}: {
  params: { domain: string };
}): Promise<Metadata> {
  const res = await fetchDataFromServer(domain);
  if (!res) notFound();
  const { data, platform } = res;
  const pageTitle =
    data?.identity == data?.displayName
      ? `${data?.displayName}`
      : `${data?.displayName} (${data?.identity})`;
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "https://web3.bio/";
  const profileDescription =
    data.description ||
    `Explore ${pageTitle} ${
      SocialPlatformMapping(platform!).label
    } Web3 identity profile, description, crypto addresses, social links, NFT collections, POAPs, Web3 social feeds, crypto assets etc on the Web3.bio Link in bio page.`;
  return {
    metadataBase: new URL(baseURL),
    title: pageTitle,
    description: profileDescription,
    alternates: {
      canonical: `/${domain}`,
    },
    openGraph: {
      type: "website",
      url: `/${domain}`,
      siteName: "Web3.bio",
      title: pageTitle,
      description: profileDescription,
      images: [
        {
          url: data.avatar || `/img/web3bio-social.jpg`,
        },
      ],
    },
  };
}

export default async function ProfilePage({
  params: { domain },
}: {
  params: { domain: string };
}) {
  const serverData = await fetchDataFromServer(domain);
  const { data, nfts, platform, relations } = serverData;
  const pageTitle =
    data.identity == data.displayName
      ? `${data.displayName}`
      : `${data.displayName} (${data.identity})`;
  return (
    <ProfileMain
      fromServer
      relations={relations}
      nfts={nfts}
      data={data}
      pageTitle={pageTitle}
      platform={platform}
    />
  );
}
