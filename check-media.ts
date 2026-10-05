import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import { GraphService } from "./src/gen/core_pb.js";

const transport = createConnectTransport({
  baseUrl: "http://localhost:5102",
  httpVersion: "1.1"
});

const client = createClient(GraphService, transport);

async function checkNode() {
  try {
    const res = await client.getNode({ slug: "byd-atto-2" });
    console.log(JSON.stringify(res.node.media, null, 2));
  } catch(e) {
    console.error(e);
  }
}
checkNode();
