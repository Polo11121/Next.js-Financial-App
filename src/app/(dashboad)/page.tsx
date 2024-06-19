"use client";

import { Button } from "@/components/ui/button";
import { useNewAccount } from "@/features/accounts/hooks/use-new-account";

const HomePage = () => {
  const { onOpen } = useNewAccount((state) => ({
    onOpen: state.onOpen,
  }));

  return <Button onClick={onOpen}>Add an account</Button>;
};

export default HomePage;
