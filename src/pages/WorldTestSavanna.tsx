// TEST ONLY (step 5.3, 2026-10-02): the new Savanna look with SAVES OFF.
// Opens only with teacher code 1006 - the brain never saves anything for that code.
// Step 5.4 (2026-10-02): TEST99 also opens (REAL saves, throwaway test kid only). Any other code gets a plain message.
import { useParams } from "react-router-dom";
import WorldPage from "./WorldPage";
import { SAVANNA_WORLD, type WorldConfig } from "@/worlds";

// Step 6 (2026-10-03): also the Ocean + Dino new-look test routes (world prop); same lock: 1006 + TEST99 only.
const WorldTestSavanna = ({ world = SAVANNA_WORLD }: { world?: WorldConfig }) => {
  const { code } = useParams<{ code: string }>();
  const c = (code ?? "").toUpperCase();
  if (c !== "1006" && c !== "TEST99") { // step 5.4: TEST99 = throwaway test kid (real saves); every other code blocked
    return <div style={{ padding: 40, fontFamily: "sans-serif", fontSize: 20 }}>Test page: teacher code only.</div>;
  }
  return <WorldPage world={world} />;
};

export default WorldTestSavanna;
