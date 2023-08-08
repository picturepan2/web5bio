"use client";
import React, { Suspense, useState } from "react";
import Link from "next/link";
import Clipboard from "react-clipboard.js";
import SVG from "react-inlinesvg";
import { RenderWidgetItem } from "./WidgetItem";
import PoapWidget from "./PoapsWidget";
import { PlatformType, SocialPlatformMapping } from "../../utils/platform";
import { Error } from "../shared/Error";
import Avatar from "boring-avatars";
import { formatText } from "../../utils/utils";
import { NFTCollectionWidget } from "./NFTCollectionWidget";
import { NFTModal, NFTModalType } from "./NFTModal";
import Image from "next/image";
// import ShareButton from "../shared/ShareButton";
export default function ProfileMain(props) {
  const { data, pageTitle = "", platform, nfts, fromServer, relations } = props;
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [curAsset, setCurAsset] = useState(null);
  const [errorAvatar, setErrorAvatar] = useState(false);
  const [dialogType, setDialogType] = useState(NFTModalType.NFT);
  const onCopySuccess = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };
  if (!data || data.error) {
    return (
      <Error
        retry={() => window.location.reload()}
        msg={data.error || "Error"}
      />
    );
  }

  return (
    <>
      <div
        className="web3bio-custom"
        style={{
          backgroundImage: data.header ? `url("${data.header}")` : "",
        }}
      ></div>
      <div className="columns">
        <div className="column col-4 col-md-12">
          <div className="web3-profile-base">
            <div className="profile-avatar">
              {data.avatar && !errorAvatar ? (
                <Image
                  src={data.avatar}
                  className="avatar"
                  priority={true}
                  alt={`${pageTitle} Avatar / Profile Photo`}
                  onError={() => {
                    setErrorAvatar(true);
                  }}
                  height={180}
                  width={180}
                />
              ) : (
                <Avatar
                  size={180}
                  name={data.identity}
                  variant="marble"
                  colors={[
                    "#FBF4EC",
                    "#ECD7C8",
                    "#EEA4BC",
                    "#BE88C4",
                    "#9186E7",
                    "#92C9F9",
                    "#92C9F9",
                  ]}
                />
              )}
            </div>
            <h1 className="text-assistive">{`${pageTitle} ${
              SocialPlatformMapping(platform).label
            } Web3 Profile`}</h1>
            <h2 className="text-assistive">{`Explore ${pageTitle} Web3 identity profile, description, crypto addresses, social links, NFT collections, POAPs, Web3 social feeds, crypto assets etc on the Web3.bio Link in bio page.`}</h2>
            <div className="profile-name">{data.displayName}</div>
            <h3 className="text-assistive">{`${pageTitle}‘s Ethereum wallet address is ${data.address}`}</h3>
            <div className="profile-identity">
              <>
                <span className="profile-label" title={`${pageTitle}‘s Ethereum wallet address is ${data.address}`}>
                  {formatText(data.address)}
                </span>
                <Clipboard
                  component="div"
                  className="action"
                  data-clipboard-text={data.address}
                  onSuccess={onCopySuccess}
                  title="Copy the Ethereum wallet address"
                >
                  <SVG src="../icons/icon-copy.svg" width={20} height={20} />
                  {copied && <div className="tooltip-copy">COPIED</div>}
                </Clipboard>
                {/* <ShareButton /> */}
              </>
            </div>

            <div className="profile-identity">
              { platform == "nextid" ? (
                  <div
                    className={`platform-badge nextid active`}
                    title={`${pageTitle} Next.ID`}
                  >
                    <div 
                      className="platform-badge-icon"
                    >
                      <SVG
                        width={20}
                        src={"icons/icon-nextid.svg"}
                        className="text-light"
                      />
                    </div>
                  </div>
                )
                 : ""
              }
              {relations?.map((x, idx) => {
                const relatedPath = `${x.identity}${
                  x.platform === PlatformType.farcaster ? ".farcaster" : ""
                }`;
                return (
                  <Link
                    href={`/${relatedPath}`}
                    key={x.platform + idx}
                    className={`platform-badge ${x.platform} ${
                      idx === 0 ? "active" : ""
                    }`}
                    title={`${pageTitle} ${SocialPlatformMapping(x.platform).label}`}
                  >
                    <div 
                      className="platform-badge-icon"
                    >
                      <SVG
                        width={20}
                        src={
                          SocialPlatformMapping(x.platform).icon ||
                          ""
                        }
                        className="text-pride"
                      />
                    </div>
                    <span className="platform-badge-name">
                      {x.identity}
                    </span>
                  </Link>
                );
              })}
            </div>

            {data.description && (
              <h2 className="profile-description">{data.description}</h2>
            )}
            {data.location && (
              <div className="profile-location">
                <span style={{ fontSize: "20px", marginRight: "5px" }}>📍</span>{" "}
                {data.location}
              </div>
            )}
            {data.email && (
              <div className="profile-email">
                <span style={{ fontSize: "20px", marginRight: "5px" }}>✉️</span>
                <a href={`mailto:${data.email}`}>{data.email}</a>
              </div>
            )}
          </div>
        </div>
        <div className="column col-8 col-md-12">
          <div className="web3-section-widgets">
            {data?.links?.map((item, idx) => {
              return (
                <div key={idx} className="profile-widget-item">
                  <RenderWidgetItem displayName={pageTitle} item={item} />
                </div>
              );
            })}
          </div>
          {data.address && (
            <>
              <div className="web3-section-widgets">
                <Suspense fallback={<p>Loading NFTs...</p>}>
                  <NFTCollectionWidget
                    fromServer={fromServer}
                    onShowDetail={(e, v) => {
                      setDialogType(NFTModalType.NFT);
                      setCurAsset(v);
                      setDialogOpen(true);
                    }}
                    address={data.address}
                    initialData={nfts || []}
                  />
                </Suspense>
              </div>
              <div className="web3-section-widgets">
                <Suspense fallback={<p>Loading Poaps...</p>}>
                  <PoapWidget
                    fromServer={fromServer}
                    onShowDetail={(v) => {
                      setDialogType(NFTModalType.POAP);
                      setCurAsset(v);
                      setDialogOpen(true);
                    }}
                    address={data.address}
                  />
                </Suspense>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="web3bio-badge">
        <Link
          href="/"
          target="_blank"
          className="btn btn-sm btn-primary"
          title="Web3.bio Web3 Identity Graph Search and Link-in-bio Profile Service"
        >
          <span className="mr-2">👋</span>Made with{" "}
          <strong className="text-pride ml-1 mr-1">Web3.bio</strong>
        </Link>
      </div>
      {dialogOpen && curAsset && (
        <NFTModal
          asset={curAsset}
          onClose={() => {
            setDialogOpen(false);
          }}
          type={dialogType}
        />
      )}
    </>
  );
}
