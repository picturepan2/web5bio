// import { fetchInitialNFTsData } from "../../hooks/api/fetchProfile";
import { PlatformType, shouldPlatformFetch } from "../../utils/platform";
import { SocialPlatformMapping } from "../../utils/utils";
import { handleSearchPlatform, mapLinks } from "../../utils/utils";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import ProfileMain from "../../components/profile/ProfileMain";
import { regexAvatar } from "../../utils/regexp";

// function mapNFTs(nfts) {
//   if (!nfts) return [];
//   return nfts.map((x) => ({
//     image_url: x.image_url,
//     previews: x.previews,
//     token_id: x.token_id,
//     collection: x.collection,
//     video_url: x.video_url,
//     audio_url: x.audio_url,
//     video_properties: x.video_properties,
//     image_properties: x.image_properties,
//     chain: x.chain,
//     extra_metadata: x.extra_metadata,
//   }));
// }

async function fetchDataFromServer(domain: string) {
  if (!domain) return null;
  try {
    const platform = handleSearchPlatform(domain);
    if (!shouldPlatformFetch(platform)) return null;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PROFILE_END_POINT}/profile/${domain}`,
      {
        next: { revalidate: 86400 },
      }
    );
    if (response.status === 404) return null;
    const data = await response.json();

    // const remoteNFTs = data[0].address
    //   ? await fetchInitialNFTsData(data[0].address)
    //   : {};
    return {
      data,
      platform,
      // nfts: remoteNFTs,
    };
  } catch (e) {
    console.log(e, "ERROR");
    return null;
  }
}

export async function generateMetadata({
  params: { domain },
}: {
  params: { domain: string };
}): Promise<Metadata> {
  const res = await fetchDataFromServer(domain);
  if (!res) {
    if (regexAvatar.test(domain)) {
      redirect(`/?s=${domain}`);
    } else {
      notFound();
    }
  }
  const { data, platform } = res;
  const profile = data[0];
  const pageTitle =
    profile?.identity == profile?.displayName
      ? `${profile?.displayName}`
      : `${profile?.displayName} (${profile?.identity})`;

  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "https://web3.bio";

  const profileDescription =
    profile?.description ||
    `Explore ${pageTitle} ${
      SocialPlatformMapping(platform!).label
    } profile, connected identities, social links, NFT collections, Web3 activities, dWebsites, POAPs etc on the Web3.bio profile page.`;
  const avatarURL = data?.find((x) => !!x.avatar)?.avatar;

  const params = new URLSearchParams();
  if (domain) params.append("path", domain);
  if (profile) params.append("address", profile.address);
  params.append("displayName", profile.displayName);
  if (profile.description) params.append("description", profile.description);
  if (avatarURL) params.append("avatar", avatarURL);
  const relativeOGURL = params.toString()
    ? `/api/og?${params.toString()}`
    : "/api/og";

  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:image": `${baseURL}${relativeOGURL}`,
  };
  JSON.parse(JSON.stringify(data))
    .splice(0, 3)
    .filter((o) => o.identity !== "")
    .map((x, index) => {
      const resolvedIdentity = `${x.identity}${
        x.platform === PlatformType.farcaster ? ".farcaster" : ""
      }`;
      fcMetadata[`fc:frame:button:${index + 1}`] = SocialPlatformMapping(
        x.platform
      ).label;
      fcMetadata[`fc:frame:button:${index + 1}:action`] = "link";
      fcMetadata[
        `fc:frame:button:${index + 1}:target`
      ] = `${baseURL}/${resolvedIdentity}`;
    });

  const defaultIdx = data.length > 3 ? 4 : data.length + 1;
  fcMetadata[`fc:frame:button:${defaultIdx}`] = "🌐 🖼 🌈 More";
  fcMetadata[`fc:frame:button:${defaultIdx}:action`] = "link";
  fcMetadata[`fc:frame:button:${defaultIdx}:target`] = `${baseURL}/${domain}`;

  return {
    metadataBase: new URL(baseURL),
    title: pageTitle + ` ${SocialPlatformMapping(platform!).label} Profile`,
    description: profileDescription,
    alternates: {
      canonical: `/${domain}`,
    },
    openGraph: {
      type: "website",
      url: `/${domain}`,
      siteName: "Web3.bio",
      title: pageTitle + ` ${SocialPlatformMapping(platform!).label} Profile`,
      images: [relativeOGURL],
      description: profileDescription,
    },
    twitter: {
      title: pageTitle + ` ${SocialPlatformMapping(platform!).label} Profile`,
      description: profileDescription,
      site: "@web3bio",
      images: [relativeOGURL],
      creator: "@web3bio",
    },
    other: {
      ...fcMetadata,
    },
  };
}

export default async function ProfilePage({
  params: { domain },
}: {
  params: { domain: string };
}) {
  const serverData = await fetchDataFromServer(domain);
  if (!serverData) notFound();
  const { data, platform } = serverData;
  const profile = data[0];
  const pageTitle =
    profile.identity == profile.displayName
      ? `${profile.displayName}`
      : `${profile.displayName} (${profile.identity})`;
  return (
    <ProfileMain
      domain={domain}
      relations={
        data?.map((x) => ({
          platform: x.platform,
          identity: x.identity,
        })) || []
      }
      nfts={{
        nfts: [],
      }}
      data={{
        ...data[0],
        links: mapLinks(data),
      }}
      fallbackAvatar={{
        source: data?.find((x) => !!x.avatar)?.platform,
        avatar: data?.find((x) => !!x.avatar)?.avatar,
      }}
      pageTitle={pageTitle}
      platform={platform}
    />
  );
}

export const runtime = "edge";
export const revalidate = 432000;
