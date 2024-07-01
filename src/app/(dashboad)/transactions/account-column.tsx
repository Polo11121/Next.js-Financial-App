import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";

type AccountColumnProps = {
  account: string;
  accountId: string;
};

export const AccountColumn = ({ account, accountId }: AccountColumnProps) => {
  const { onOpen } = useOpenAccount((state) => ({
    onOpen: state.onOpen,
  }));

  const openHandler = () => onOpen(accountId);

  return (
    <div
      onClick={openHandler}
      className="flex items-center cursor-pointer hover:underline"
    >
      {account}
    </div>
  );
};
