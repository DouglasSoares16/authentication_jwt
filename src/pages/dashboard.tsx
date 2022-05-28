import { useContext, useEffect } from "react";
import { Heading, Box } from "@chakra-ui/react";

import { AuthContext } from "../contexts/AuthContext";
import { withSSRAuth } from "../utils/withSSRAuth";
import { api } from "../services/apiClient";
import { setupAPIClient } from "../services/api";
import { Can } from "../components/Can";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    api.get("/me").then(response => console.log(response))
  }, [])

  return (
    <>
      <Heading>Dashboard: {user?.email}</Heading>

      <Can permissions={["metrics.list"]}>
        <Box mt="6">Métricas</Box>
      </Can>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get("/me");

  console.log(response.data);

  return {
    props: {}
  }
});
