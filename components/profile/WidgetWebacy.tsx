import SVG from "react-inlinesvg";
import { PlatformType, SocialPlatformMapping } from "../utils/platform";
import useSWR from "swr";
import { WEBACY_API_ENDPOINT, webacyFetcher } from "../apis/webacy";
import { regexSolana } from "../utils/regexp";

export function WidgetWebacy({ address }) {
  const { data, error } = useSWR(
    `${WEBACY_API_ENDPOINT}/addresses/${address}?chain=${
      regexSolana.test(address) ? "sol" : "eth"
    }`,
    webacyFetcher
  );
  console.log(data,'webacy')
  return (
    <div className="rss-item">
      <div className="rss-item-tag">
        <span className="label text-dark">
          <SVG
            fill={"#121212"}
            src={SocialPlatformMapping(PlatformType.webacy).icon || ""}
            height={18}
            width={18}
            className="mr-1"
          />
          {SocialPlatformMapping(PlatformType.webacy).label}
        </span>
      </div>
      <div className="rss-item-title">
        <h2 className="profile-widget-title">
          <span className="emoji-large mr-2">🚨 </span>
          WebacyScore{" "}
          <span className="label ml-2">
            {Number(data?.overallRisk).toFixed(2)}
          </span>
        </h2>
      </div>
    </div>
  );
}
