"use client";
import styled from "styled-components";
import { useGameContext } from "@/utilitiy/providers/GameProvider";
import { initializeWorkerService } from "@/services/workerService";
import Home from "@/pages/home";
import Menu from "@/components/menu";
import { useEffect } from "react";
import Leaderboard from "@/pages/leaderboard";
import Wallet from "@/pages/wallet";
import About from '@/pages/about';
import Settings from '@/pages/settings';

const S = {
  Main: styled.div`
    max-width: 430px;
    margin: 0 auto;
  `,
};

type command = "profileVer" | "miningStatus";

interface channelWroker {
  cmd: command;
  data: any[];
}

const channelWrokerListenName = "toFrontEnd";
const profileVerChannel = new BroadcastChannel(channelWrokerListenName);

const listeningPool: Map<string, (e: MessageEvent<any>) => void> = new Map();

const listeningManager = (key: string, fun: (e: MessageEvent<any>) => void) => {
  const listening = listeningPool.get(key);
  if (listening) {
    profileVerChannel.removeEventListener("message", listening);
  }
  listeningPool.set(key, fun);
  profileVerChannel.addEventListener("message", fun);
};

export const listeningProfileHook = (
  profileHook: React.Dispatch<React.SetStateAction<any[]>>
) => {
  const fun = (e: MessageEvent<any>) =>
    profileVerChannelListening(e, null, profileHook);
  return listeningManager("listeningProfileHook", fun);
};

const profileVerChannelListening = (
  e: MessageEvent<any>,
  miningHook: React.Dispatch<React.SetStateAction<any[]>> | null = null,
  profileHook: React.Dispatch<React.SetStateAction<any[]>> | null = null
) => {
  let cmd: channelWroker;
  try {
    cmd = JSON.parse(e.data);
  } catch (ex) {
    return console.log(
      `profileVerChannel JSON.parse(e.data[${e.data}]) Error!`
    );
  }

  switch (cmd.cmd) {
    case "miningStatus": {
      if (miningHook) {
        return miningHook(cmd?.data);
      }
      return "";
    }

    case "profileVer": {
      if (profileHook) {
        return profileHook(cmd?.data);
      }
      return "";
    }

    default: {
      return console.log(
        `profileVerChannelListening unknow command [${cmd.cmd}] from backend [${cmd.data}]`
      );
    }
  }
};

export const listeningMiningHook = (
  miningHook: React.Dispatch<React.SetStateAction<any[]>>
) => {
  const fun = (e: MessageEvent<any>) =>
    profileVerChannelListening(e, miningHook);
  return listeningManager("listeningMiningHook", fun);
};

export default function App() {
  const {
    router,
    setProfile,
    setLeaderboard,
    setMiningRate,
    setOnlineMiners,
    leaderboard,
  } = useGameContext();

  listeningMiningHook((response: any) => {
    try {
      const [data] = response;
      const parsedData = JSON.parse(data);

      setMiningRate(Number(parsedData?.rate));
      setOnlineMiners(parsedData?.online);
    } catch (error) {
      console.error("Error parsing mining data", error);
    }
  });

  listeningProfileHook((response: any) => {
    try {
      const [profile, leader] = response;
      setProfile(profile);
      if (leaderboard.allTime.length === 0) setLeaderboard(leader);
    } catch (error) {
      console.error("Error parsing balance data", error);
    }
  });

  useEffect(() => {
    initializeWorkerService();
  }, []);
  return (
    <>
      <S.Main>
        {router === "/" && <Home />}
        {router === "/leaderboard" && <Leaderboard />}
        {router === "/wallet" && <Wallet />}
        {router === "/about" && <About />}
        {router === "/settings" && <Settings />}
      </S.Main>
      <Menu />
    </>
  );
}