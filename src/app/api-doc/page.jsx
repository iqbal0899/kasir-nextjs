import { getApiDocs } from "@/lib/swagger";
import ReactSwagger from "./react-swagger";

export default async function ApiDocsPage() {
  const spec = await getApiDocs();

  return (
    <main>
      <ReactSwagger spec={spec} />
    </main>
  );
}