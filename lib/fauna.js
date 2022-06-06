import fauna from "faunadb";

const getClient = () => {
    const client = new fauna.Client({
      secret: "fnAEoTtHg9AAR7UhHffB0PAbXPZGnMzLnf_sxdNs",
      domain: "db.us.fauna.com",
    });
    return client;
  };

export const client = getClient();