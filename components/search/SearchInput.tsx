"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import SVG from "react-inlinesvg";
import { useSearchParams } from "next/navigation";
import {
  PlatformSystem,
  PlatformType,
  SocialPlatformMapping,
} from "../utils/platform";
import { getSearchSuggestions } from "../utils/utils";

export type SearchListItemType = {
  key: PlatformType;
  label: string;
  system?: PlatformSystem;
  icon?: string;
};

export default function SearchInput(props) {
  const { defaultValue, handleSubmit, inputRef } = props;
  const [query, setQuery] = useState(defaultValue);
  const [searchList, setSearchList] = useState<Array<SearchListItemType>>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchParams = useSearchParams();
  const web2ScrollContainer = useRef<HTMLDivElement>(null);
  
  const emitSubmit = useCallback((e, value?) => {
    if (searchParams?.get("availability")) {
      handleSubmit(query, "suggest");
      return;
    }

    const platform = value?.key && [PlatformType.farcaster, PlatformType.bitcoin].includes(value.key) || value?.system === PlatformSystem.web2
      ? value.key
      : "";

    const _value = typeof value === "string" ? value : value?.label || "";

    if (_value && _value === searchParams?.get("s")) {
      setQuery(_value);
    }
    handleSubmit(_value, platform);
  }, [query, searchParams, handleSubmit]);

  const onKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      const _value = searchList[activeIndex] || query.replaceAll("。", ".");
      emitSubmit(e, _value);
    } else if (e.key === "Escape") {
      setActiveIndex(-1);
      if (activeIndex === -1) setSearchList([]);
    } else if (e.key === "ArrowUp" || (e.shiftKey && e.key === "Tab")) {
      e.preventDefault();
      setActiveIndex((prevIndex) => 
        prevIndex <= 0 ? searchList.length - 1 : prevIndex - 1
      );
    } else if (e.key === "ArrowDown" || (!e.shiftKey && e.key === "Tab")) {
      e.preventDefault();
      setActiveIndex((prevIndex) => 
        prevIndex >= searchList.length - 1 ? 0 : prevIndex + 1
      );
    }
  }, [searchList, activeIndex, query, emitSubmit]);

  const filteredWeb3List = useMemo(() => 
    searchList.filter(x => x.system === PlatformSystem.web3),
  [searchList]);

  const filteredWeb2List = useMemo(() => 
    searchList.filter(x => x.system === PlatformSystem.web2),
  [searchList]);

  const handleQueryChange = useCallback((e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (!newQuery || newQuery === defaultValue) {
      setSearchList([]);
    } else {
      setSearchList(getSearchSuggestions(newQuery.replaceAll("。", ".")));
    }
    setActiveIndex(-1);
  }, [defaultValue]);

  const shouldShowWeb2List = useMemo(() => 
    ![".", "。", "/"].some(x => query.includes(x)) && query.length < 25,
  [query]);

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        placeholder="Ethereum (ENS), Farcaster, Lens, UD, or Web3 domains..."
        value={query}
        onChange={handleQueryChange}
        onKeyDown={onKeyDown}
        className="form-input input-lg"
        autoCorrect="off"
        autoComplete="off"
        autoFocus
        spellCheck="false"
        id="searchbox"
      />
      <button
        className="form-button btn"
        onClick={(e) => emitSubmit(e, query.replaceAll("。", "."))}
      >
        <SVG
          src="icons/icon-search.svg"
          width={24}
          height={24}
          className="icon"
        />
      </button>
      {searchList.length > 0 && (
        <div className="search-list">
          {filteredWeb3List.map((x, idx) => (
            <div
              className={`search-list-item${activeIndex === idx ? " search-list-item-active" : ""}`}
              key={x.label + idx}
              onClick={(e) => emitSubmit(e, x)}
            >
              <SVG
                fill="#121212"
                src={x.icon || "icons/icon-search.svg"}
                width={20}
                height={20}
              />
              <div className="search-list-item-label">{x.label}</div>
            </div>
          ))}
          {
            <>
              <li className="divider" />
              <div
                ref={web2ScrollContainer}
                className={"search-web2-list noscrollbar"}
              >
                {shouldShowWeb2List && (
                  <>
                    {filteredWeb2List.map((x) => {
                      const activeIdx = searchList.findIndex(i => i.key === x.key);
                      return (
                        <div
                          id={x.key}
                          onClick={() => emitSubmit(null, { ...x, label: query, system: PlatformSystem.web2 })}
                          key={x.key}
                          className={`search-list-item${activeIndex === activeIdx ? " search-list-item-active" : ""}`}
                        >
                          <SVG
                            fill="#121212"
                            src={SocialPlatformMapping(x.key).icon || ""}
                            width={20}
                            height={20}
                          />
                        </div>
                      );
                    })}
                  </>
                )}

                <div
                  className="btn suggest-btn"
                  onClick={(e) => {
                    emitSubmit(e, {
                      label: query,
                      key: "suggest",
                      system: PlatformSystem.web2,
                    });
                  }}
                >
                  Check Availability
                </div>
              </div>
            </>
          }
        </div>
      )}
    </>
  );
}
