import _ from "lodash";
const enum SocialActionType {
  // todo: expand action type
  follow = 1,
  followedBy = 2,
  transferOut = 3,
  transferIn = 4,
}
export const useInitialPackingSocialGraphData = (data) => {
  const nodes = new Array();
  const edges = new Array();
  if (!data) return { nodes: [], edges: [] };
  data.socialFollows.followerTopology.forEach((x) => {
    if (
      !nodes.some(
        (i) => i.platform === x.dataSource && i.id === x.originalTarget.id
      )
    ) {
      nodes.push({
        ...x.originalTarget,
        graphId: x.target,
        children: [],
      });
    }
    const parent = nodes.find((i) => i.id === x.originalTarget.id);

    if (parent) {
      parent.children.push({
        ...x.originalSource,
        type: SocialActionType.followedBy,
      });
    }
  });

  data.socialFollows.followingTopology.forEach((x) => {
    if (
      !nodes.some(
        (i) => i.platform === x.dataSource && i.id === x.originalSource.id
      )
    ) {
      nodes.push({
        ...x.originalSource,
        graphId: x.source,
        children: [],
      });
    }
    const parent = nodes.find((i) => i.id === x.originalSource.id);

    if (parent) {
      parent.children.push({
        ...x.originalTarget,
        type: SocialActionType.follow,
      });
    }
  });

  const _nodes = nodes.reduce((pre, cur) => {
    if (cur.children?.length) {
      pre.push({
        id: cur.id + ",social",
        displayName: `items:${cur.children.length}`,
        platform: cur.platform,
        amount: cur.children.length,
        cluster: true,
      });
    }
    pre.push(cur);
    return pre;
  }, []);
  _nodes.forEach((x) => {
    if (x.children) {
      edges.push({
        source: x.id,
        target: _nodes.find((i) => i.platform === x.platform)?.id,
        platform: x.platform,
        label: x.platform,
        id: `${x.id}*${_nodes.find((i) => i.platform === x.platform)?.id}`,
      });
    }
  });
  return {
    nodes: _nodes,
    edges,
  };
};

export const useIdentitySocialGraphData = (data) => {
  if (!data) return { nodes: [], edges: [] };
  return {
    nodes: data.queryIdentityGraph?.[0]?.vertices || [],
    edges: data.queryIdentityGraph?.[0]?.edges || [],
  };
};
