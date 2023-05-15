import { memo, useEffect, useMemo, useRef, useState } from "react";
import useSWRInfinite from "swr/infinite";
import { ExpandController } from "./ExpandController";
import { NFTCollections } from "./NFTCollections";
import { _fetcher } from "../apis/ens";
import { SIMPLE_HASH_URL } from "../apis/simplehash";
import _ from "lodash";

const PAGE_SIZE = 20;

const getURL = (index, address, previous) => {
  if (
    index !== 0 &&
    previous &&
    (!previous.nfts.length || !previous?.next_cursor)
  )
    return null;
  const cursor = previous?.next_cursor || "";
  return (
    SIMPLE_HASH_URL +
    `/api/v0/nfts/owners?chains=ethereum&wallet_addresses=${address}${
      cursor ? "&cursor=" + cursor : ""
    }&limit=${PAGE_SIZE}`
  );
};

function useNFTs(address: string, initialData) {
  const { data, error, size, isValidating, setSize } = useSWRInfinite(
    (index, previous) => getURL(index, address, previous),
    _fetcher,
    initialData && {
      initialSize: 0,
      fallbackData: [initialData],
      revalidateOnFocus: false,
    }
  );
  return {
    data,
    isLoading: !error && !data,
    isError: error,
    size,
    isValidating,
    setSize,
  };
}

const RenderNFTCollectionWidget = (props) => {
  const { identity, onShowDetail, initialData } = props;
  const [collections, setCollections] = useState([]);
  const { data, size, setSize, isValidating, isError } = useNFTs(
    identity.addresses?.eth ?? identity.owner,
    initialData
  );

  const [expand, setExpand] = useState(false);
  const scrollContainer = useRef(null);

  const issues = useMemo(() => {
    return data
      ? data.reduce((pre, cur) => {
          if (cur.nfts) {
            cur.nfts.map((x) => {
              if (!_.includes(pre, x)) pre.push(x);
            });
          }
          return pre;
        }, [])
      : [];
  }, [data]);
  const isReachingEnd =
    data && data.length > 0 && !data[data.length - 1].next_cursor;

  useEffect(() => {
    if (issues && issues.length > 0) {
      const unionCollections = issues.reduce((pre, x) => {
        if (x.collection.spam_score <= 75) {
          pre.push({
            ...x.collection,
            id: x.collection.collection_id,
            assets: [],
          });
        }
        return pre;
      }, []);
      const res = _.uniqBy(unionCollections, "collection_id");
      if (res.length > 0) {
        issues.forEach((i) => {
          if (!i.collection || !i.collection.collection_id) return;
          const idx = res.findIndex((x) => {
            return x.id && x.id === i.collection.collection_id;
          });
          if (idx === -1) return;
          if (_.some(res[idx].assets, i)) return;
          res[idx].assets.push(i);
        });
      }
      setCollections(res);
    }
  }, [issues]);

  if (!collections.length || isError) return null;

  return (
    <div ref={scrollContainer} className="profile-widget-full" id="nft">
      <div
        className={`profile-widget profile-widget-nft${
          expand ? " active" : ""
        }`}
      >
        <ExpandController
          expand={expand}
          onToggle={() => {
            setExpand(!expand);
          }}
        />
        <h2 className="profile-widget-title">
          <span className="emoji-large mr-2">🖼</span>
          NFT Collections
        </h2>
        <NFTCollections
          handleScrollToAsset={(ref, v) => {
            setExpand(true);
            setTimeout(() => {
              if (ref) {
                const anchorElement = document.getElementById(v);
                if (!anchorElement) return;
                const top = anchorElement.offsetTop;
                ref.current.scrollTo({
                  top: top,
                  behavior: "smooth",
                });
              }
            }, 400);
          }}
          parentScrollRef={scrollContainer}
          expand={expand}
          setExpand={setExpand}
          data={collections}
          onShowDetail={onShowDetail}
          isLoadingMore={isValidating}
          isReachingEnd={isReachingEnd}
          isError={isError}
          getNext={() => {
            if (isValidating || isReachingEnd) return;
            setSize(size + 1);
          }}
        />
      </div>
    </div>
  );
};

export const NFTCollectionWidget = memo(RenderNFTCollectionWidget);
