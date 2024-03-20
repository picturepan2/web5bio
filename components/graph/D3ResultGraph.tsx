import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { formatText, SocialPlatformMapping } from "../../utils/utils";
import { PlatformType } from "../../utils/platform";
import _ from "lodash";
import SVG from "react-inlinesvg";
import { Empty } from "../shared/Empty";
import { resolveIdentityGraphData } from "./hook";
import { isValidEthereumAddress } from "../../utils/regexp";

const IdentityNodeSize = 48;
const NFTNodeSize = 14;

const getNodeRadius = (isIdentity) =>
  isIdentity ? IdentityNodeSize : NFTNodeSize;
const getMarkerRefX = (d) => {
  return d.target.isIdentity
    ? IdentityNodeSize + (d.isSingle ? 30 : 26)
    : NFTNodeSize + (d.isSingle ? 16 : 8);
};

export function calcTranslation(targetDistance, point0, point1) {
  let x1_x0 = point1.x - point0.x,
    y1_y0 = point1.y - point0.y,
    x2_x0,
    y2_y0;
  if (y1_y0 === 0) {
    x2_x0 = 0;
    y2_y0 = targetDistance;
  } else {
    let angle = Math.atan(x1_x0 / y1_y0);
    x2_x0 = -targetDistance * Math.cos(angle);
    y2_y0 = targetDistance * Math.sin(angle);
  }
  return {
    dx: x2_x0,
    dy: y2_y0,
  };
}

const updateNodes = (nodeContainer) => {
  const identityBadge = nodeContainer
    .append("circle")
    .attr("class", "identity-badge")
    .attr("r", 16)
    .attr("fill", (d) => SocialPlatformMapping(d.platform).color)
    .attr("style", (d) => `display:${d.isIdentity ? "normal" : "none"}`);

  const identityIcon = nodeContainer
    .append("svg:image")
    .attr("class", "identity-icon")
    .attr(
      "xlink:href",
      (d) => SocialPlatformMapping(d.platform.toLowerCase()).icon
    )
    .attr("style", (d) => `display:${d.isIdentity ? "normal" : "none"}`);

  const ensBadge = nodeContainer
    .append("svg:image")
    .attr("class", "ens-icon")
    .attr("xlink:href", SocialPlatformMapping(PlatformType.ens).icon)
    .attr("style", (d) => `display:${d.isIdentity ? "none" : "normal"}`);

  const displayName = nodeContainer
    .append("text")
    .attr("class", "displayName")
    .attr("id", (d) => d.id)
    .style("transform", (d) =>
      !d.displayName || d.displayName === d.identity
        ? "translateY(0.25rem)"
        : "none"
    )
    .text((d) => formatText(d.displayName));

  const identity = nodeContainer
    .append("text")
    .attr("class", "identity")
    .attr("id", (d) => d.id)
    .style("display", (d) => (d.isIdentity ? "normal" : "none"))
    .text((d) => {
      if (!d.displayName || d.displayName === d.identity) return "";
      return formatText(d.identity || d.address);
    });
  return {
    identityBadge,
    identityIcon,
    ensBadge,
    displayName,
    identity,
  };
};

export default function D3IdentityGraph(props) {
  const { data, onClose, title, onBack, disableBack, containerRef } = props;
  const [currentNode, setCurrentNode] = useState<any>(null);
  const [hideTooltip, setHideToolTip] = useState(true);
  const [transform, setTransform] = useState([0, 0]);

  useEffect(() => {
    if (!data) return;
    let chart = null;
    const chartContainer = containerRef?.current;
    const generateGraph = (_data) => {
      const width = chartContainer?.offsetWidth!;
      const height = chartContainer?.offsetHeight!;
      const links = _data.links.map((d) => ({ ...d }));
      const nodes = _data.nodes.map((d) => ({ ...d }));

      const removeHighlight = () => {
        setHideToolTip(true);
        setCurrentNode(null);
        edgeLabels.attr("class", "edge-label");
        edgePath.attr("class", "edge-path");
        maskCircle.attr("opacity", 0);
        circle.attr("class", "node");
        displayName.attr("class", "displayName");
        identity.attr("class", "identity");
      };
      const svg = d3
        .select(".svg-canvas")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .call(
          d3
            .zoom()
            .scaleExtent([1, 1])
            .on("zoom", (e) => {
              svg.attr("transform", e.transform);
            })
            .on("start", () => {
              setHideToolTip(true);
            })
            .on("end", (e) => {
              setTransform([e.transform.x, e.transform.y]);
              setHideToolTip(false);
            })
        )
        .on("click", removeHighlight)
        .append("svg:g");

      const generateSimulation = () => {
        const simulation = d3
          .forceSimulation(nodes)
          .force(
            "link",
            d3
              .forceLink(links)
              .id((d) => d.id)
              .distance((d) => (d.target.isIdentity ? 60 : 10))
          )
          .force("charge", d3.forceManyBody())
          .force("x", d3.forceX(width / 2).strength(0.5))
          .force("y", d3.forceY(height / 2).strength(1.3))
          .force(
            "collision",
            d3
              .forceCollide()
              .radius((d) =>
                d.isIdentity ? IdentityNodeSize * 2 : NFTNodeSize * 2.25
              )
          )
          .force("center", d3.forceCenter(width / 2, height / 2))
          .stop();

        return simulation;
      };

      const simulation = generateSimulation();
      // marker
      svg
        .append("defs")
        .selectAll("marker")
        .data(links)
        .join("marker")
        .attr("id", (d) => `arrow-${d.id}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("markerUnits", "userSpaceOnUse")
        .attr("markerWidth", 7)
        .attr("markerHeight", 7)
        .attr("refX", (d) => getMarkerRefX(d))
        .attr("orient", "auto")
        .append("path")
        .attr("fill", "#cecece")
        .attr("d", "M0,-5L10,0L0,5");

      const edgePath = svg
        .selectAll(".edge-path")
        .data(links)
        .enter()
        .append("path")
        .attr("stroke-width", 0.8)
        .attr("class", "edge-path")
        .attr("id", (d) => "edgepath" + d.id)
        .attr("marker-end", (d) => `url(#arrow-${d.id})`);

      const edgeLabels = svg
        .selectAll(".edge-label")
        .data(links)
        .enter()
        .append("text")
        .attr("id", (d) => d.id)
        .attr("class", "edge-label")
        .attr("dx", ".5em")
        .attr("dy", "3px")
        .attr("text-anchor", "middle")
        .text((d) => (d.target.isIdentity ? d.label : ""));

      const dragged = (event, d) => {
        const clamp = (x, lo, hi) => {
          return x < lo ? lo : x > hi ? hi : x;
        };
        d.fx = clamp(event.x, 0, width);
        d.fy = clamp(event.y, 0, height);
        nodeContainer.each((o) => {
          if (o != d) {
            o.fx = o.x;
            o.fy = o.y;
          }
        });
        simulation.alpha(1).restart();
      };
      const nodeContainer = svg
        .selectAll(".node")
        .data(nodes, (d) => d.id)
        .join("g")
        .call(
          d3
            .drag()
            .on("drag", dragged)
            .on("start", () => setHideToolTip(true))
            .on("end", () => setHideToolTip(false))
        );

      const circle = nodeContainer
        .append("circle")
        .attr("stroke-width", 2)
        .attr("r", (d) => getNodeRadius(d.isIdentity))
        .attr("stroke", (d) => SocialPlatformMapping(d.platform).color)
        .attr("fill", (d) =>
          d.isIdentity ? "#fff" : SocialPlatformMapping(PlatformType.ens).color
        );
      const maskCircle = nodeContainer
        .attr("id", (d) => d.id)
        .append("circle")
        .attr("class", "node")
        .attr("fill", (d) => SocialPlatformMapping(d.platform).color)
        .attr("fill-opacity", 0.1)
        .attr("opacity", 0)
        .attr("r", (d) => getNodeRadius(d.isIdentity))
        .on("click", (e, i) => {
          e.preventDefault();
          e.stopPropagation();
          removeHighlight();
          highlightNode(i);
        });

      const { displayName, identity, identityBadge, identityIcon, ensBadge } =
        updateNodes(nodeContainer);
      const ticked = () => {
        edgePath.attr("d", (d) => {
          const delta = calcTranslation(4, d.source, d.target);
          const rightwardSign = d.target.x > d.source.x ? 2 : -2;
          return (
            "M" +
            (d.isSingle ? d.source.x : d.source.x + rightwardSign * delta.dx) +
            "," +
            (d.isSingle ? d.source.y : d.source.y + -rightwardSign * delta.dy) +
            "L" +
            (d.isSingle ? d.target.x : d.target.x + rightwardSign * delta.dx) +
            "," +
            (d.isSingle ? d.target.y : d.target.y + -rightwardSign * delta.dy)
          );
        });

        circle.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
        maskCircle.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

        displayName
          .attr("dx", (d) => d.x)
          .attr("dy", (d) => {
            if (!d.isIdentity) return d.y + NFTNodeSize * 2;
            if (
              d.displayName !== "" &&
              (d.displayName !== d.identity || d.address)
            )
              return d.y;
            return d.y + 6;
          })
          .attr("text-anchor", "middle");
        identity
          .attr("dx", (d) => d.x)
          .attr("dy", (d) => (d.isIdentity ? d.y + 14 : 0))
          .attr("text-anchor", "middle");

        identityBadge
          .attr("cx", (d) => d.x + IdentityNodeSize / 2 + 8)
          .attr("cy", (d) => d.y - IdentityNodeSize / 2 - 8);

        identityIcon
          .attr("x", (d) => d.x + IdentityNodeSize / 2 - 2)
          .attr("y", (d) => d.y - IdentityNodeSize / 2 - 18);

        ensBadge.attr("x", (d) => d.x - 9).attr("y", (d) => d.y - 10);

        edgeLabels.attr("transform", (d) => {
          let transformation = ``;

          const x = (d.source.x + d.target.x) / 2;
          const y = (d.source.y + d.target.y) / 2;
          transformation += `translate(${x}, ${y}) `;

          if (d.source.x > d.target.x) {
            transformation += `rotate(180) `;
          }
          const angle = Math.atan2(
            d.target.y - d.source.y,
            d.target.x - d.source.x
          );
          transformation += `rotate(${(angle * 180) / Math.PI}) `;

          return transformation;
        });
      };

      const highlightNode = (i) => {
        if (hideTooltip) setHideToolTip(false);
        setCurrentNode(i);
        nodeContainer.filter((l) => l.id === i.id).raise();
        edgeLabels
          .filter((l) => l.id.includes(i.id))
          .attr("class", "edge-label edge-label-selected");
        edgePath
          .filter((l) => l.source.id === i.id || l.target.id === i.id)
          .attr("class", "edge-path edge-selected");
        circle.filter((l) => l.id === i.id).attr("class", "node node-selected");
        maskCircle.filter((l) => l.id === i.id).attr("opacity", 1);
        displayName
          .filter((l) => l.id === i.id)
          .attr("class", "displayName displayName-selected");
        identity
          .filter((l) => l.id === i.id)
          .attr("class", "identity identity-selected");
      };

      d3.timeout(() => {
        for (
          let i = 0,
            n = Math.ceil(
              Math.log(simulation.alphaMin()) /
                Math.log(1 - simulation.alphaDecay())
            );
          i < n;
          ++i
        ) {
          simulation.tick();
        }
        ticked();
        simulation.on("tick", ticked);
      });
      return svg.node();
    };

    if (!chart && chartContainer) {
      const res = resolveIdentityGraphData(data);
      chart = generateGraph({ nodes: res.nodes, links: res.edges });
    }
    return () => {
      const svg = d3.select(".svg-canvas");
      svg.selectAll("*").remove();
    };
  }, [data]);
  return (
    <>
      {(data && <svg className="svg-canvas" />) || (
        <Empty title={"No Identity graph found"} />
      )}

      <div className="graph-header">
        <div className="graph-title">
          <SVG src={"/icons/icon-view.svg"} width="20" height="20" />
          <span className="ml-2">
            Identity Graph for
            <strong className="ml-1">{title}</strong>
          </span>
        </div>
        <div className="graph-header-action">
          {!disableBack && (
            <div className="btn" onClick={onBack}>
              <SVG src={"/icons/icon-open.svg"} width="20" height="20" />
              Back
            </div>
          )}
          <div className="btn" onClick={onClose}>
            <SVG src={"/icons/icon-close.svg"} width="20" height="20" />
          </div>
        </div>
      </div>
      {currentNode && !hideTooltip && (
        <div
          className="web3bio-tooltip"
          style={{
            left:
              currentNode.x +
              (currentNode.isIdentity ? IdentityNodeSize : NFTNodeSize) / 3,
            top:
              currentNode.y +
              (currentNode.isIdentity ? IdentityNodeSize : NFTNodeSize) / 3,
            transform: `translate(${transform[0]}px,${transform[1]}px)`,
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {currentNode.isIdentity ? (
            <ul>
              <li className="text-large text-bold">
                {currentNode.displayName || "-"}
              </li>
              <li className="mb-1">
                {currentNode.identity != currentNode.displayName
                  ? isValidEthereumAddress(currentNode.identity)
                    ? formatText(currentNode.identity)
                    : currentNode.identity
                  : ""}
              </li>
              {(currentNode.uid && (
                <li>
                  <span className="text-gray">
                    {currentNode.platform === PlatformType.farcaster
                      ? "FID"
                      : "UID"}
                    :{" "}
                  </span>
                  {currentNode.uid}
                </li>
              )) ||
                ""}
              {((currentNode.address ||
                currentNode.platform === PlatformType.ethereum) && (
                <li>
                  <span className="text-gray">Address: </span>
                  {currentNode.address || currentNode.identity}
                </li>
              )) ||
                ""}
              <li>
                <span className="text-gray">Platform: </span>
                {SocialPlatformMapping(currentNode.platform as PlatformType)
                  ?.label ||
                  currentNode.platform ||
                  "Unknown"}
              </li>
            </ul>
          ) : (
            <ul>
              <li className="text-large text-bold mb-1">
                {currentNode.identity || ""}
              </li>
              <li>
                <span className="text-gray">Platform: </span>
                {currentNode.platform || ""}
              </li>
              <li>
                <span className="text-gray">Resolved: </span>
                {currentNode.resolvedAddress || ""}
              </li>
              <li>
                <span className="text-gray">Owner: </span>
                {currentNode.owner || ""}
              </li>
            </ul>
          )}
        </div>
      )}
    </>
  );
}
