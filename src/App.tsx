
import './App.css';
import "./fonts.css";
import Playground from './components/playground';
import StartMessage from './components/start';
import Wallet from './components/wallet';
import About from './components/about';
import { useFlappyBirdContext } from './providers/FlappyBirdProvider';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { initializeWorkerService } from './services/workerService';
import { fetchWalletData } from './API/getData';
import { BackgroundAudio, ButtonClick } from './shared/assets';
import { playAudio, stopAudio } from './shared/functions';
import { useAudioPlayer } from 'react-use-audio-player';
import { toast, ToastContainer } from 'react-toastify';
import SelectDifficulty from './components/difficulty';

type command = "balanceStatus" | "miningStatus";

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

export const listeningMiningHook = (
  miningHook: React.Dispatch<React.SetStateAction<any[]>>,
) => {
  const fun = (e: MessageEvent<any>) =>
    profileVerChannelListening(e, miningHook);
  return listeningManager("listeningMiningHook", fun);
};

export const listeningBalanceHook = (
  balanceHook: React.Dispatch<React.SetStateAction<any[]>>,
) => {
  const fun = (e: MessageEvent<any>) =>
    profileVerChannelListening(e, null, balanceHook);
  return listeningManager("listeningBalanceHook", fun);
};


const profileVerChannelListening = (
  e: MessageEvent<any>,
  miningHook: React.Dispatch<React.SetStateAction<any[]>> | null = null,
  balanceHook: React.Dispatch<React.SetStateAction<any[]>> | null = null
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

    case "balanceStatus": {
      if (balanceHook) {
        return balanceHook(cmd?.data);
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

function App() {

  const { path, setPrivateKey, setWalletAddress, audio, mining, setMining, setOnlineMiners, setMiningRate, setBalance, gameStatus } = useFlappyBirdContext();

  const backAudioRef = useRef<HTMLAudioElement | null>(null);
  const { load } = useAudioPlayer();

  useEffect(() => {
    if (gameStatus === 2 || !audio)
      return;

    const container = document.getElementsByTagName("button");

    const buttonArray = Array.from(container);
    const init = () => {
      load(ButtonClick, {
        autoplay: true,
      })
    }
    buttonArray.map(element => {
      element.addEventListener("click", init);
    });
  }, [path, gameStatus])

  useEffect(() => {
    if (audio)
      playAudio(backAudioRef);
  }, [path, audio])

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

  listeningBalanceHook((response: any) => {
    try {
      const [data] = response;
      setBalance(parseFloat(data));
    } catch (error) {
      console.error("Error parsing balance data", error);
    }
  });

  useEffect(() => {
    const init = async () => {
      await initializeWorkerService();

      const result = await fetchWalletData();

      if (result && result.length >= 1) {
        if (result[0] === 'SUCCESS') {
          if (result[1][0] !== '')
            setWalletAddress(result[1][0]);
          if (result[1][1] !== '')
            setPrivateKey(result[1][1]);
        }
      } else {
        toast.error(result?.message);
      }
    }

    init();
  }, [])

  return (
    <div className="App">
      {
        path === '/' && <StartMessage /> ||
        path === '/start' && <Playground /> ||
        path === '/difficulty' && <SelectDifficulty /> ||
        path === '/wallet' && <Wallet /> ||
        path === '/about' && <About />
      }
      {
        path !== '/start' && audio &&
        <audio src={BackgroundAudio} ref={backAudioRef} loop />
      }

      <ToastContainer autoClose={false} position='bottom-center' toastStyle={{ fontFamily: "FlappyBird", fontSize: "1.2rem" }} />
    </div>
  );
}

export default App;
