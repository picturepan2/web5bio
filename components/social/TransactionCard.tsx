import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { ActivityTypeMapping, formatText } from "../../utils/utils";
import { RenderToken } from "./FeedItem";

const RenderTransactionCard = (props) => {
  const { action } = props;
  const metadata = action?.metadata;

  switch (action.type) {
    case ("multisig"):
      return (
        <>
          <div className="feed-content">
            {ActivityTypeMapping(action.type).action["default"]}
            {action.platform && (
              <span className="feed-platform">{" "}on {action.platform}</span>
            )} 
          </div>
          {/* <div className="feed-content">
            <div className="feed-target">
              <div className="feed-target-content">
                {metadata.action}
              </div>
            </div>
          </div> */}
        </>
      );
    case ("bridge"):
      return (
        <>
          <div className="feed-content">
            {ActivityTypeMapping(action.type).action["default"]}
            {RenderToken(metadata.token)}
            {action.platform && (
              <span className="feed-platform">{" "}on {action.platform}</span>
            )} 
          </div>
        </>
      );
    default:
      return (
        <div className="feed-content">
          {ActivityTypeMapping(action.type).action["default"]}
          {RenderToken(metadata)}
          {ActivityTypeMapping(action.type).prep && (
            <>
              {" "}{ActivityTypeMapping(action.type).prep}{" "}
              <span className="feed-identity ml-1">{" "}{formatText(action.to)}</span>
            </>
          )}
        </div>
      );
  }
};

export const TransactionCard = memo(RenderTransactionCard);