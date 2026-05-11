import UI from "./ui";

export default async function app(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const { error } = searchParams;
  return <UI error={error} />;
}
