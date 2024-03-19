import { PlatformType } from "../../utils/platform";
import { SocialPlatformMapping, formatText } from "../../utils/utils";
import _ from "lodash";

export const resolveIdentityGraphData = (source) => {
  const nodes = new Array<any>();
  const edges = new Array<any>();
  source.nodes.forEach((x) => {
    const resolvedPlatform = SocialPlatformMapping(x.platform);
    nodes.push({
      id: x.id,
      label:
        x.platform === PlatformType.ens
          ? formatText(x.id)
          : formatText(x.displayName || x.identity),
      platform: resolvedPlatform.key || x.platform,
      displayName: x.profile?.displayName || x.displayName || x.identity,
      identity: x.profile?.identity || x.identity || x.id,
      uid: x.uid,
      address:
        x.platform === PlatformType.ens
          ? source.edges
              .find((i) => i.target === `${x.platform},${x.identity}`)
              ?.source.slice(9)
          : x.profile?.address || x.identity,
      isIdentity: x.platform === PlatformType.ens ? false : true,
    });
  });
  source.edges.forEach((x) => {
    const resolvedPlatform = SocialPlatformMapping(x.dataSource);
    edges.push({
      source: x.source,
      target: x.target,
      label: x.label
        ? x.label
        : resolvedPlatform
        ? resolvedPlatform.label
        : x.dataSource,
      id: `${x.source}*${x.target}`,
    });
  });
  const _nodes = _.uniqBy(nodes, "id");
  const _edges = _.uniqBy(edges, "id");
  const resolvedEdges = _edges.map((x) => ({
    ...x,
    isSingle: isSingleEdge(_edges, x),
  }));
  return { nodes: _nodes, edges: resolvedEdges };
};
export const isSingleEdge = (data, d) => {
  if (
    data.find((x) => d.source === x.target) &&
    data.find((x) => d.target === x.source)
  )
    return false;
  return true;
};
