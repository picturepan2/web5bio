"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Loading } from "@/components/shared/Loading";
import useSWR from "swr";
import DashboardProfileMain from "@/components/dashboard/DashboardProfileMain";
import { DocumentNode, useLazyQuery } from "@apollo/client";
import { PlatformType } from "@/components/utils/platform";
import { getProfileQuery } from "@/components/utils/queries";
import { ProfileFetcher, profileAPIBaseURL } from "@/components/utils/api";

export default function WalletProfilePage() {
  const { address } = useAccount();
  const [authed, setAuthed] = useState(false);
  const [text, setText] = useState("Querying authorization status...");
  const [resolvedData, setResolvedData] = useState([]);
  const router = useRouter();

  const { data, isLoading } = useSWR(
    authed ? `${profileAPIBaseURL}/profile/${address}` : null,
    ProfileFetcher
  );

  const [getQuery, { loading, error: isError, data: profileData }] =
    useLazyQuery(getProfileQuery() as DocumentNode, {
      variables: {
        platform: PlatformType.ethereum,
        identity: address?.toLowerCase(),
      },
    });

  useEffect(() => {
    if (!address) {
      setText("Unauthorized, redirecting to home page");
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } else {
      setAuthed(true);
      getQuery();
      if (isLoading) {
        setText("Fetching data from Web3.bio...");
      }
      if (data?.length) {
        setResolvedData(data);
      }
      if (profileData?.identity && data?.length) {
        const _data = JSON.parse(JSON.stringify(data));

        _data?.forEach((i) => {
          const rsItem = profileData.identity.identityGraph.vertices.find(
            (x) =>
              x.identity === i.identity &&
              [PlatformType.dotbit, PlatformType.ens].includes(x.platform)
          );
          if (rsItem) {
            i.expiredAt = rsItem.expiredAt;
          }
        });
        setResolvedData(_data);
      }
    }
  }, [address, router, isLoading, data, getQuery, profileData]);

  return (
    <>
      {!authed || isLoading || !resolvedData?.length ? (
        <div className="web3-profile container grid-xl global-loading">
          <Loading />
          <p className="mt-4">{text}</p>
        </div>
      ) : (
        <DashboardProfileMain data={resolvedData} />
      )}
    </>
  );
}
