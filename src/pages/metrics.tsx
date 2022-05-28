import { Heading } from "@chakra-ui/react";

import { withSSRAuth } from "../utils/withSSRAuth";
import { setupAPIClient } from "../services/api";

export default function Metrics() {
  return (
    <>
      <Heading>Metrics</Heading>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get("/me");

  return {
    props: {}
  }
},
  {
    permissions: ["metrics.list"],
    roles: ["administrator"]
  }
);
