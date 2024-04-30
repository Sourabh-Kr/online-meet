import Player from "@/component/Player";
import useMediaStream from "@/hooks/useMediaStream";
import usePlayer from "@/hooks/usePlayer";
import { useEffect, useState } from "react";
import styles from "@/styles/room.module.css";
import Bottom from "@/component/Bottom";
import { useRouter } from "next/router";
import { cloneDeep } from "lodash";
import CopySection from "@/component/CopySection";

const { useSocket } = require("@/context/socket");
const { default: usePeer } = require("@/hooks/usePeer");

const Room = () => {
  const socket = useSocket();
  const { roomId } = useRouter().query;
  const { peer, myId } = usePeer();
  const { stream } = useMediaStream();
  const {
    players,
    setPlayers,
    playerHighlighted,
    nonHighlightedPlayers,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  } = usePlayer(myId, roomId, peer);
  const [users, setUsers] = useState({});
  useEffect(() => {
    if (!socket || !peer || !stream || !setPlayers) return;
    const handleUserConnected = (newUser) => {
      console.log(`user connected in room  with userId ${newUser}`);
      // user 1 in the Room
      // user 2 join the Room
      // user 1 call user 2 with its own stream
      const call = peer.call(newUser, stream);
      // user 1 listen for other peer stream i.e user 2
      call.on("stream", (incomingStream) => {
        console.log(`incomingStream from ${newUser}`);
        setPlayers((prev) => ({
          ...prev,
          [newUser]: {
            url: incomingStream,
            muted: true,
            playing: true,
          },
        }));
        setUsers((prev) => ({
          ...prev,
          [newUser]: call,
        }));
      });
    };
    socket.on("user-connected", handleUserConnected);
    return () => {
      socket.off("user-connected", handleUserConnected);
    };
  }, [peer, setPlayers, socket, stream]);

  useEffect(() => {
    if (!peer || !stream) return;
    peer.on("call", (call) => {
      const { peer: callerId } = call;
      call.answer(stream); // user 2 sent back their stream

      // user 2 listen for other peer stream i.e user 1
      call.on("stream", (incomingStream) => {
        console.log(`incomingStream from ${callerId}`);
        setPlayers((prev) => ({
          ...prev,
          [callerId]: {
            url: incomingStream,
            muted: true,
            playing: true,
          },
        }));
      });
      setUsers((prev) => ({
        ...prev,
        [callerId]: call,
      }));
    });
  }, [peer, setPlayers, stream]);
  useEffect(() => {
    if (!stream || !myId || !setPlayers) return;
    console.log(`setting my stream id ${myId}`);
    setPlayers((prev) => ({
      ...prev,
      [myId]: {
        url: stream,
        muted: true,
        playing: true,
      },
    }));
  }, [myId, setPlayers, stream]);

  useEffect(() => {
    if (!socket) return;
    const handleToggleAudio = (userId) => {
      console.log(`use with id ${userId} toggled Audio`);
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        copy[userId].muted = !copy[userId].muted;
        return { ...copy };
      });
    };
    socket.on("user-toggle-audio", handleToggleAudio);
    return () => {
      socket.off("user-toggle-audio", handleToggleAudio);
    };
  }, [setPlayers, socket]);

  useEffect(() => {
    if (!socket) return;
    const handleToggleVideo = (userId) => {
      console.log(`use with id ${userId} toggled video`);
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        copy[userId].playing = !copy[userId].playing;
        return { ...copy };
      });
    };
    const handleUserLeave = (userId) => {
      console.log(`user ${userId} is leaving the Room`);
      users[userId]?.close();
      const playersCopy = cloneDeep(players);
      delete playersCopy[userId];
      setPlayers(playersCopy);
    };
    socket.on("user-toggle-video", handleToggleVideo);
    socket.on("user-leave", handleUserLeave);
    return () => {
      socket.off("user-toggle-video", handleToggleVideo);
      socket.off("user-leave", handleUserLeave);
    };
  }, [players, setPlayers, socket, users]);

  return (
    <>
      <div className={styles.activePlayerContainer}>
        {playerHighlighted && (
          <Player
            url={playerHighlighted.url}
            muted={playerHighlighted.muted}
            playing={playerHighlighted.playing}
            isActive={true}
          />
        )}
      </div>
      <div className={styles.inActivePlayerContainer}>
        {Object.keys(nonHighlightedPlayers).map((playerId) => {
          const { url, muted, playing } = nonHighlightedPlayers[playerId];
          return (
            <Player
              key={playerId}
              url={url}
              muted={muted}
              playing={playing}
              isActive={false}
            />
          );
        })}
      </div>
      {/* <CopySection roomId={roomId} /> */}
      <Bottom
        muted={playerHighlighted?.muted}
        playing={playerHighlighted?.playing}
        toggleAudio={toggleAudio}
        toggleVideo={toggleVideo}
        leaveRoom={leaveRoom}
      />
    </>
  );
};

export default Room;
