// TEST ONLY (step 5.3, 2026-10-02): the new Savanna look with SAVES OFF.
// Opens only with teacher code 1006 - the brain never saves anything for that code.
// Any other code gets a plain message, so no kid row (and no TEST99 row) can be written from here.
import { useParams } from "react-router-dom";
import WorldPage from "./WorldPage";
import { SAVANNA_WORLD } from "@/worlds";

const WorldTestSavanna = () => {
  const { code } = useParams<{ code: string }>();
  if ((code ?? "").toUpperCase() !== "1006") {
    return <div style={{ padding: 40, fontFamily: "sans-serif", fontSize: 20 }}>Test page: teacher code only.</div>;
  }
  return <WorldPage world={SAVANNA_WORLD} />;
};

export default WorldTestSavanna;
