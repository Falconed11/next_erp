import { UpdateActiveStatus } from "@/components/my/input";

export const renderFilterActive = (data, mutate, onFetch, user) => (
  <UpdateActiveStatus
    data={data}
    mutate={mutate}
    onFetch={onFetch}
    user={user}
  />
);
