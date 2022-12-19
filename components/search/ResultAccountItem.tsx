import React, { memo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Clipboard from "react-clipboard.js";
import SVG from "react-inlinesvg";
import { formatText } from "../../utils/utils";
import { RenderSourceFooter } from "./SourcesFooter";
import { PlatformType } from "../../utils/type";

const RenderAccountItem = (props) => {
  const { onItemClick } = props;
  const onCopySuccess = () => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  };
  const { identity, sources } = props;
  const [isCopied, setIsCopied] = useState(false);

  switch (identity.platform) {
    case PlatformType.ethereum:
      return (
        <div className="social-item social-web3 ethereum">
          <div className="social-main">
            <div className="social">
              <figure className="avatar bg-pride">
                <SVG src="icons/icon-ethereum.svg" width={20} height={20} />
              </figure>
              <div className="content">
                <div className="content-title text-bold">
                  {identity.displayName
                    ? identity.displayName
                    : formatText(identity.identity)}
                </div>
                <div className="content-subtitle text-gray">
                  <div className="address hide-xs">{identity.identity}</div>
                  <div className="address show-xs">
                    {formatText(identity.identity)}
                  </div>
                  <Clipboard
                    component="div"
                    className="action"
                    data-clipboard-text={identity.identity}
                    onSuccess={onCopySuccess}
                  >
                    <SVG src="icons/icon-copy.svg" width={20} height={20} />
                    {isCopied && <div className="tooltip-copy">COPIED</div>}
                  </Clipboard>
                </div>
              </div>
            </div>
            {identity.nft?.length > 0 && (
              <div className="nfts">
                {identity.nft.map((nft, idx) => {
                  return nft.category == "ENS" ? (
                    <Link
                      key={`${nft.uuid}-${idx}`}
                      href={{
                        pathname: "/",
                        query: { s: nft.id },
                      }}
                    >
                      <div className="label-ens" title={nft.id}>
                        <Image
                          src="/icons/icon-ens.svg"
                          width={16}
                          height={16}
                          alt="ens"
                        />
                        <span>{nft.id}</span>
                      </div>
                    </Link>
                  ) : null;
                })}
              </div>
            )}
          </div>
          <div className="social-actions">
            <button
              className="btn btn-sm btn-link action"
              title="Link Identity Panel"
              onClickCapture={() => onItemClick(identity, PlatformType.ens)}
            >
              <SVG src="icons/icon-open.svg" width={20} height={20} />
            </button>
          </div>
          <RenderSourceFooter sources={sources} />
        </div>
      );
    case PlatformType.lens:
      return (
        <div className="social-item lens">
          <div className="social-main">
            <div className="social">
              <figure className="avatar bg-lens">
                <SVG src="icons/icon-lens.svg" width={20} height={20} />
              </figure>
              <div className="content">
                <div className="content-title text-bold">
                  {identity.displayName
                    ? identity.displayName
                    : identity.identity}
                </div>
                <div className="content-subtitle text-gray">
                  <div className="address">{identity.identity}</div>
                  <Clipboard
                    component="div"
                    className="action"
                    data-clipboard-text={identity.identity}
                    onSuccess={onCopySuccess}
                  >
                    <SVG src="icons/icon-copy.svg" width={20} height={20} />
                    {isCopied && <div className="tooltip-copy">COPIED</div>}
                  </Clipboard>
                </div>
              </div>
            </div>
            <div className="actions">
              <a
                className="btn btn-sm btn-link action"
                href={`https://www.lensfrens.xyz/${identity.identity}`}
                title="Open LensFrens"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SVG src="icons/icon-open.svg" width={20} height={20} /> OPEN
              </a>
            </div>
          </div>
          <RenderSourceFooter sources={sources} />
        </div>
      );
    case PlatformType.dotbit:
      return (
        <div className="social-item dotbit">
          <div className="social-main">
            <Link
              href={{
                pathname: "/",
                query: {
                  s: identity.identity,
                },
              }}
            >
              <div className="social">
                <div className="icon">
                  <SVG src="icons/icon-dotbit.svg" width={20} height={20} />
                </div>
                <div className="title">{identity.displayName}</div>
              </div>
            </Link>
            <div className="actions">
              <a
                className="btn btn-sm btn-link action"
                href={`https://data.did.id/${identity.displayName}`}
                title="Open Keybase"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SVG src="icons/icon-open.svg" width={20} height={20} /> OPEN
              </a>
            </div>
          </div>
          <RenderSourceFooter sources={sources} />
        </div>
      );
    case PlatformType.twitter:
      return (
        <div className="social-item twitter">
          <div className="social-main">
            <Link
              href={{
                pathname: "/",
                query: { s: identity.identity },
              }}
            >
              <div className="social">
                <div className="icon">
                  <SVG src="icons/icon-twitter.svg" width={20} height={20} />
                </div>
                <div className="title">{identity.displayName}</div>
              </div>
            </Link>
            <div className="actions">
              <a
                className="btn btn-sm btn-link action"
                href={`https://twitter.com/${identity.identity}`}
                title="Open Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SVG src="icons/icon-open.svg" width={20} height={20} /> OPEN
              </a>
            </div>
          </div>
          <RenderSourceFooter sources={sources} />
        </div>
      );
    case PlatformType.github:
      return (
        <div className="social-item github">
          <div className="social-main">
            <Link
              href={{
                pathname: "/",
                query: {
                  s: identity.identity,
                  platform: identity.platform,
                },
              }}
            >
              <div className="social">
                <div className="icon">
                  <SVG src="icons/icon-github.svg" width={20} height={20} />
                </div>
                <div className="title">{identity.displayName}</div>
              </div>
            </Link>
            <div className="actions">
              <a
                className="btn btn-sm btn-link action"
                href={`https://github.com/${identity.identity}`}
                title="Open GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SVG src="icons/icon-open.svg" width={20} height={20} /> OPEN
              </a>
            </div>
          </div>
          <RenderSourceFooter sources={sources} />
        </div>
      );
    case PlatformType.keybase:
      return (
        <div className="social-item keybase">
          <div className="social-main">
            <Link
              href={{
                pathname: "/",
                query: {
                  s: identity.identity,
                  platform: identity.platform,
                },
              }}
            >
              <div className="social">
                <div className="icon">
                  <SVG src="icons/icon-keybase.svg" width={20} height={20} />
                </div>
                <div className="title">{identity.displayName}</div>
              </div>
            </Link>
            <div className="actions">
              <a
                className="btn btn-sm btn-link action"
                href={`https://keybase.io/${identity.displayName}`}
                title="Open Keybase"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SVG src="icons/icon-open.svg" width={20} height={20} /> OPEN
              </a>
            </div>
          </div>
          <RenderSourceFooter sources={sources} />
        </div>
      );
    case PlatformType.reddit:
      return (
        <div className="social-item reddit">
          <div className="social-main">
            <Link
              href={{
                pathname: "/",
                query: {
                  s: identity.identity,
                  platform: identity.platform,
                },
              }}
            >
              <div className="social">
                <div className="icon">
                  <SVG src="icons/icon-reddit.svg" width={20} height={20} />
                </div>
                <div className="title">{identity.displayName}</div>
              </div>
            </Link>
            <div className="actions">
              <a
                className="btn btn-sm btn-link action"
                href={`https://www.reddit.com/user/${identity.displayName}`}
                title="Open Reddit"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SVG src="icons/icon-open.svg" width={20} height={20} /> OPEN
              </a>
            </div>
          </div>
          <RenderSourceFooter sources={sources} />
        </div>
      );
    default:
      return null;
  }
};

export const ResultAccountItem = memo(RenderAccountItem);
