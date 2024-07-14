import type { LoadedFileRoute } from "file-router";
import { GET as editGet, POST as editPost } from "./routes/[table]/edit";
import { GET as detailGET } from "./routes/[table]/index";
import { GET as rowGET } from "./routes/[table]/row";
import { GET as indexGET } from "./routes/index";
import { GET as sqlGET, POST as sqlPOST } from "./routes/sql";

export const databaseRoutes = [
  { filePath: "/[table]/index.tsx", GET: detailGET },
  { filePath: "/[table]/edit.tsx", GET: editGet, POST: editPost },
  { filePath: "/[table]/row.tsx", GET: rowGET },
  { filePath: "/index.tsx", GET: indexGET },
  { filePath: "/sql.tsx", GET: sqlGET, POST: sqlPOST },
] satisfies LoadedFileRoute[];
