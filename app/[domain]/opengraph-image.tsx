import { ImageResponse } from "next/server";
import { PlatformType, SocialPlatformMapping } from "../../utils/platform";
import { handleSearchPlatform } from "../../utils/utils";

// Route segment config
export const runtime = "edge";
// Image metadata
export const size = {
  width: 800,
  height: 400,
};

const fetchAvatar = async (domain: string) => {
  const platform = handleSearchPlatform(domain);
  const url =
    process.env.NEXT_PUBLIC_PROFILE_END_POINT +
    `/profile/${platform.toLowerCase()}/${domain}`;
  return await fetch(url).then((res) => res.json());
};

export const contentType = "image/png";

// Image generation
export default async function Image({
  params,
}: {
  params: { domain: string };
}) {
  let avatarURL;
  const { domain } = params;
  const data = await fetchAvatar(domain);
  console.log(data.avatar);
  avatarURL = await fetch(data.avatar, {
    mode: "no-cors",
    next: { revalidate: 60 },
  })
    .then((res) => res.arrayBuffer())
    .catch((e) => "https://web3.bio/logo-web3bio.png");

  console.log(avatarURL, "avatar");
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          letterSpacing: "-.02em",
          background: "linear-gradient(to left,#636fa4,#e8cbc0)",
        }}
      >
        <div
          style={{
            left: 42,
            top: 42,
            position: "absolute",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            width={24}
            height={24}
            src="https://web3.bio/logo-web3bio.png"
            alt=""
          />
          <span
            style={{
              marginLeft: 8,
              fontSize: 20,
            }}
          >
            Web3.bio
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 80,
            padding: "20px 50px",
            margin: "0 42px",
            fontSize: 48,
            lineHeight: 1.4,
            textAlign: "center",
          }}
        >
          <img
            width={"200px"}
            height={"200px"}
            src={avatarURL}
            style={{
              borderRadius: "50%",
              boxShadow: "inset 0 0 6px 6px rgba(255, 255, 255, .1)",
            }}
            alt={domain}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <div>{data.displayName}</div>
            <div>{data.identity}</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              {Object.keys(data?.links).map((x) => {
                return (
                  <img
                    style={{
                      color: "#fff",
                    }}
                    key={x}
                    width={36}
                    height={36}
                    src={`https://web3.bio/${
                      SocialPlatformMapping(x as PlatformType).icon
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
