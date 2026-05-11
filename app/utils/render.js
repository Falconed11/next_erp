import { UpdateActiveStatus } from "@/components/input";

export const renderFilterActive = (data, mutate, onFetch, user) => (
  <UpdateActiveStatus
    data={data}
    mutate={mutate}
    onFetch={onFetch}
    user={user}
  />
);
