"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Loading } from "../shared/Loading";
import SVG from "react-inlinesvg";
import { POAPFetcher, POAP_ENDPOINT } from "../apis/poap";
import { resolveIPFS_URL } from "../../utils/ipfs";
import { NFTAssetPlayer } from "../shared/NFTAssetPlayer";
import { useDispatch } from "react-redux";
import { updatePoapsWidget } from "../../state/widgets/action";

function usePoaps(address: string) {
  const { data, error, isValidating } = useSWR(
    `${POAP_ENDPOINT}${address}`,
    POAPFetcher,
    {
      suspense: true,
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: true,
    }
  );
  return {
    data: data || [],
    isLoading: isValidating,
    isError: error,
  };
}

export default function WidgetPOAP({ address, onShowDetail }) {
  const { data, isLoading } = usePoaps(address);
  const [render, setRender] = useState(false);
  const dispatch = useDispatch();
  const getBoundaryRender = useCallback(() => {
    if (isLoading)
      return (
        <div className="widget-loading">
          <Loading />
        </div>
      );
    return null;
  }, [isLoading]);
  useEffect(() => {
    setRender(true);
    if (!isLoading) {
      dispatch(
        updatePoapsWidget({ isEmpty: !data?.length, initLoading: false })
      );
    }
  }, [data, isLoading, dispatch]);

  if (!data || !data.length || !render) {
    return null;
  }

  // if (process.env.NODE_ENV !== "production") {
  //   console.log("POAP Data:", data);
  // }

  return (
    render && (
      <div className="profile-widget-full" id="poap">
        <div className="profile-widget profile-widget-poap">
          <div className="profile-widget-header">
            <h2
              className="profile-widget-title"
              title="Proof of Attendance Protocol (POAP)"
            >
              <span className="emoji-large mr-2">🔮 </span>
              POAPs
            </h2>
            <h3 className="text-assistive">
              POAP is a curated ecosystem for the preservation of memories. By
              checking-in at different events, POAP collectors build a digital
              scrapbook where each POAP is an anchor to a place and space in
              time.
            </h3>
            <div className="widget-action">
              <div className="action-icon">
                <Link
                  className="btn btn-sm"
                  title="More on POAPs"
                  href={`https://app.poap.xyz/scan/${address}`}
                  target={"_blank"}
                >
                  <SVG src="icons/icon-open.svg" width={20} height={20} />
                </Link>
              </div>
            </div>
          </div>

          <div className="widget-poap-list noscrollbar">
            {getBoundaryRender() ||
              data.map((x, idx) => {
                return (
                  <div
                    key={idx}
                    className="poap-item c-hand"
                    onClick={(e) => {
                      onShowDetail({
                        collection: {
                          url: "",
                          name: "",
                        },
                        address: x.owner,
                        tokenId: x.tokenId,
                        asset: x,
                        mediaURL: resolveIPFS_URL(x.event.image_url),
                      });
                    }}
                  >
                    <NFTAssetPlayer
                      className="img-container"
                      src={`${resolveIPFS_URL(x.event.image_url)}?size=small`}
                      alt={x.event.name}
                      height={64}
                      width={64}
                      placeholder={true}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    )
  );
}
