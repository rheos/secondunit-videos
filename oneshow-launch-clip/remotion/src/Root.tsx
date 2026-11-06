import { Composition } from "remotion";
import { Launch } from "./Launch";
import spec from "../../shared/spec.json";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="OneShowLaunch"
        component={Launch}
        durationInFrames={spec.frames}
        fps={spec.fps}
        width={spec.width}
        height={spec.height}
        defaultProps={{ debug: false }}
      />
    </>
  );
};
