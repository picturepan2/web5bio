import { resolveMediaURL } from "../utils/utils";
import { NFTAssetPlayer } from "../shared/NFTAssetPlayer";
import Link from "next/link";
import SVG from "react-inlinesvg";

export default function MediaModalContent(props) {
  const { type, url, alt, onClose } = props;
  return (
    <>
      <div className="modal-actions">
        <Link
          href={resolveMediaURL(url)}
          target={"_blank"}
          className="btn external-icon"
        >
          <SVG src={"/icons/icon-open.svg"} width="20" height="20" />
          View Original
        </Link>
        <div className="btn btn-close" onClick={onClose}>
          <SVG src={"/icons/icon-close.svg"} width="20" height="20" />
        </div>
      </div>
      <div className="nft-preview">
        <div className="preview-container">
          <div
            className="preview-overlay"
            style={{
              backgroundImage: "url(" + resolveMediaURL(url) + ")",
            }}
            onClick={onClose}
          ></div>
          <div className="preview-image">
            <NFTAssetPlayer
              className="img-container"
              src={resolveMediaURL(url)}
              type={type}
              alt={alt ?? "media"}
            />
          </div>
        </div>
      </div>
    </>
  );
}
