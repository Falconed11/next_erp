import { UpdateActiveStatus } from "@/components/input";

export const renderFilterActive = (data, mutate, onFetch) => (
  <UpdateActiveStatus data={data} mutate={mutate} onFetch={onFetch} />
);
