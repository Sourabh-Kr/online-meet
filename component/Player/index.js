import ReactPlayer from "react-player";

import { Mic, MicOff, UserSquare2 } from "lucide-react";
import cx from "classnames";
import styles from "@/component/Player/index.module.css";

const Player = (props) => {
  const { muted, url, playing, isActive } = props;
  return (
    <div
      className={cx(styles.playerContainer, {
        [styles.notActive]: !isActive,
        [styles.active]: isActive,
      })}
    >
      {playing ? (
        <ReactPlayer
          url={url}
          muted={muted}
          playing={playing}
          width="100%"
          height="100%"
        />
      ) : (
        <UserSquare2 className={styles.user} size={isActive ? 400 : 150} />
      )}
      {!isActive ? (
        muted ? (
          <MicOff className={styles.icon} size={20} />
        ) : (
          <Mic className={styles.icon} size={20} />
        )
      ) : undefined}
    </div>
  );
};

export default Player;
