import { useState, useContext, FormEvent } from "react";
import { Flex, FormControl, FormLabel, Input, Button, Center } from "@chakra-ui/react";

import { AuthContext } from "../contexts/AuthContext";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useContext(AuthContext);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const data = {
      email,
      password
    };

    await signIn(data);
  }

  return (
    <Flex align="center" justifyContent="center" margin="auto" maxW={500} h="100vh">
      <FormControl as="form" onSubmit={handleSubmit}>
        <FormLabel htmlFor="email">Email</FormLabel>
        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />

        <FormLabel mt="4" htmlFor="password">Password</FormLabel>
        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}  />

        <Center mt="4">
          <Button type="submit" colorScheme='blue'>Login</Button>
        </Center>
      </FormControl>
    </Flex>
  )
}
