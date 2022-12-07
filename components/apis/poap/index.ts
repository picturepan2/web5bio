const AUTHENTICATION = process.env.NEXT_PUBLIC_POAP_API_KEY;
export const POAP_END_POINT = "https://api.poap.tech/actions/scan/";
export const POAPFetcher = async (url) => {
  console.log(url, AUTHENTICATION,'poap')
  const res = await fetch(url, {
    headers: {
      "x-api-key": AUTHENTICATION,
      accept: "application/json",
    },
  });
  return res.json();
};
