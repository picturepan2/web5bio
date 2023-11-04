"use client";
import { useEffect, memo } from "react";
import useSWR from "swr";
import { RSSFetcher, RSS_ENDPOINT } from "../apis/rss";
import SVG from "react-inlinesvg";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { updateRssWidget } from "../../state/widgets/action";
import { handleSearchPlatform } from "../../utils/utils";
import { PlatformType } from "../../utils/platform";
import RssItem from "./RssItem";

function getQueryDomain(
  domain: string,
  relations: Array<{ platform: PlatformType; identity: string }>
) {
  const pureDomain = domain.endsWith(".farcaster")
    ? domain.replace(".farcaster", "")
    : domain;
  const platform = handleSearchPlatform(pureDomain);
  if ([PlatformType.ens, PlatformType.dotbit].includes(platform))
    return pureDomain;
  return (
    relations.find((x) => x.platform === PlatformType.ens)?.identity ||
    relations.find((x) => x.platform === PlatformType.dotbit)?.identity
  );
}

function useRSS(domain: string, relations, fromServer) {
  const queryDomain = getQueryDomain(domain, relations);
  const fetchUrl = (() => {
    if (!queryDomain) return null;
    return `${RSS_ENDPOINT}rss?query=${queryDomain}&mode=list`;
  })();
  const { data, error, isValidating } = useSWR(fetchUrl, RSSFetcher, {
    suspense: !fromServer,
    revalidateOnFocus: false,
    revalidateOnMount: true,
    revalidateOnReconnect: true,
  });
  return {
    data: data || [],
    isLoading: isValidating,
    isError: error,
  };
}

const RenderWidgetRSS = ({
  domain, relations, fromServer
}) => {
  const { data, isLoading } = useRSS(
    domain,
    relations,
    fromServer
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isLoading && data && data?.items?.length) {
      dispatch(updateRssWidget({ isEmpty: false }));
    }
  }, [data, isLoading, dispatch]);

  if (!data || !data?.items?.length) return null;

  // if (process.env.NODE_ENV !== "production") {
  //   console.log("RSS Data:", data);
  // }

  return (
    <div className="profile-widget-full" id="rss">
      <div className="profile-widget profile-widget-rss">
        <div className="profile-widget-header">
          <h2 className="profile-widget-title">
            <span className="emoji-large mr-2">📰 </span>
            {data.title}
          </h2>
          {data.description && (
            <h3 className="text-assistive">{data.description}</h3>
          )}
          <div className="widget-action">
            <Link
              className="action-icon"
              href={data.link}
              target={"_blank"}
              title={`Click to learn more`}
            >
              <div className="btn btn-sm tooltip" title="More Articles">
                <SVG src="icons/icon-open.svg" width={20} height={20} />
              </div>
            </Link>
          </div>
        </div>
        
        <div className="widget-rss-list noscrollbar">
          {data?.items.map((x, idx) => {
            return <RssItem data={x} key={idx} />;
          })}
        </div>
      </div>
    </div>
  );
};

export const WidgetRSS = memo(RenderWidgetRSS);
