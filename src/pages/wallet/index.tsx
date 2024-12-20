import BackButton from "@/components/backButton";
import { Button } from "@/components/button";
import CurrentBalance from "@/components/currentBalance";
import { FlexDiv } from "@/components/div";
import MiningStatus from "@/components/miningStatus";
import { P } from "@/components/p";
import { slice } from "@/utilitiy/functions";
import { Img } from "@/utilitiy/images";
import { useGameContext } from "@/utilitiy/providers/GameProvider";
import Image from "next/image";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { FaCheck } from "react-icons/fa6";
import copy from "copy-to-clipboard";
import { fetchImportWallet, fetchstopMining } from "@/API/getData";
import { toast } from "react-toastify";
import ConfirmModal from "@/components/modal/confirmModal";
import styled from "styled-components";

const S = {
  BuyButton: styled(FlexDiv)`
    width: 100%;
    background-image: linear-gradient(90deg, #79f8ff 0%, #d775ff 50%);
    border-radius: 16px;
    padding: 1px;
  `,
};

export default function Wallet() {
  const [newWalletPrivateKey, setNewWalletPrivateKey] = useState<string>("");
  const [copiedReferrer, setCopiedReferrer] = useState<boolean>(false);
  const [copiedPrivateKey, setCopiedPrivateKey] = useState<boolean>(false);
  const [copiedWalletAddress, setCopiedWalletAddress] =
    useState<boolean>(false);
  const [showImportWalletConfirmModal, setShowImportWalletConfirmModal] =
    useState<boolean>(false);
  const [isImportingWallet, setIsImportingWallet] = useState<boolean>(false);

  const { profile, setProfile, setMining, miningErrorTimeout, setRouter } =
    useGameContext();

  useEffect(() => {
    if (copiedWalletAddress) {
      setTimeout(() => {
        setCopiedWalletAddress(false);
      }, 4000);
    }
    if (copiedPrivateKey) {
      setTimeout(() => {
        setCopiedPrivateKey(false);
      }, 4000);
    }
    if (copiedReferrer) {
      setTimeout(() => {
        setCopiedReferrer(false);
      }, 4000);
    }
  }, [copiedWalletAddress, copiedPrivateKey, copiedReferrer]);

  const copyText = (text: string, type: string) => {
    copy(text);
    if (type === "walletAddress") {
      setCopiedWalletAddress(true);
      return;
    }
    if (type === "walletPrivateKey") {
      setCopiedPrivateKey(true);
      return;
    }
    if (type === "referrer") {
      setCopiedReferrer(true);
      return;
    }
  };

  const handleImportWalletButton = () => {
    if (newWalletPrivateKey) {
      setShowImportWalletConfirmModal(true);
    } else {
      toast.error("Please enter a private key");
    }
  };

  const handleImportWalletConfirm = async () => {
    setIsImportingWallet(true);

    if (newWalletPrivateKey) {
      const stopMiningResult = await fetchstopMining(profile?.keyID);

      if (stopMiningResult && !stopMiningResult?.error) {
        miningErrorTimeout?.current && clearTimeout(miningErrorTimeout.current);
        setMining?.(false);

        const importResult = await fetchImportWallet(newWalletPrivateKey);
        if (importResult && !importResult?.error) {
          setProfile?.(importResult);
          setNewWalletPrivateKey("");
          toast.success("Import Successful!");
        } else {
          toast.error(importResult?.message);
        }
      } else {
        toast.error("Failed to stop mining to import wallet");
      }
    } else {
      toast.error("Please enter a private key");
    }

    setIsImportingWallet(false);
    setShowImportWalletConfirmModal(false);
  };

  return (
    <>
      <FlexDiv $direction="column" $gap="22px" $margin="12px 16px 140px 16px">
        <MiningStatus />

        <BackButton text="My Wallet" />

        <FlexDiv>
          <CurrentBalance asset="cntp" secondaryAsset="conet" />
        </FlexDiv>

        {/* uncomment this to show the asset transfer button */}
        <div className="split"></div>
        <FlexDiv $direction="column" $gap="10px">
          <P $fontSize="24px">Assets Exchange</P>
          <P $color="#C8C6C8">
            Quickly and securely exchange your CNTP, Skins, Keys, or Tickets
            with ease.
          </P>
          <S.BuyButton>
            <Button
              $background="#17181F"
              $fontSize="16px"
              $width="100%"
              $radius="16px"
              $padding="5px 0"
              $height="56px"
              onClick={() => setRouter?.("/send")}
            >
              <FlexDiv $align="center" $gap="5px">
                <Image src={Img.SendImg} width={24} height={22} alt="" />
                Send
              </FlexDiv>
            </Button>
          </S.BuyButton>
        </FlexDiv>

        <FlexDiv $direction="column" $gap="8px" $width="100%">
          <FlexDiv
            $direction="column"
            $gap="16px"
            $width="100%"
            $padding="14px 24px"
            $border="1px solid rgba(255, 255, 255, .1)"
            $radius="16px"
          >
            <P $fontSize="24px">Your CoNETian Wallet</P>
            <FlexDiv $direction="column" $gap="16px">
              <FlexDiv $direction="column" $gap="12px">
                <P $color="#C8C6C8">Wallet Address</P>
                <FlexDiv $padding="0 16px" $justify="space-between">
                  <P>
                    {slice(profile?.keyID)}
                    {!profile?.keyID && <Skeleton width={100} />}
                  </P>
                  <Button
                    onClick={() => copyText(profile?.keyID, "walletAddress")}
                  >
                    {copiedWalletAddress ? (
                      <FaCheck />
                    ) : (
                      <Image
                        height={24}
                        width={24}
                        alt="Copy"
                        src={Img.CopyImg}
                      />
                    )}
                  </Button>
                </FlexDiv>
              </FlexDiv>
              <FlexDiv $direction="column" $gap="12px">
                <P $color="#C8C6C8">Private key</P>
                <FlexDiv $padding="0 16px" $justify="space-between">
                  <P>
                    {slice(profile?.privateKeyArmor)}
                    {!profile?.privateKeyArmor && <Skeleton width={100} />}
                  </P>
                  <Button
                    onClick={() =>
                      copyText(profile?.privateKeyArmor, "walletPrivateKey")
                    }
                  >
                    {copiedPrivateKey ? (
                      <FaCheck />
                    ) : (
                      <Image
                        height={24}
                        width={24}
                        alt="Copy"
                        src={Img.CopyImg}
                      />
                    )}
                  </Button>
                </FlexDiv>
              </FlexDiv>
            </FlexDiv>
          </FlexDiv>
          {profile?.referrer && (
            <>
              <FlexDiv $gap="8px" $align="center" $padding="0 0 0 24px">
                <P $fontSize="14px" $color="#C8C6C8">
                  Your inviter:
                </P>
                <FlexDiv $gap="8px" $align="center">
                  <P $fontSize="12px">{slice(profile?.referrer)}</P>
                  <Button
                    onClick={() => copyText(profile?.referrer, "referrer")}
                  >
                    <Image
                      height={16}
                      width={16}
                      alt="Copy"
                      src={copiedReferrer ? Img.CheckImg : Img.CopyImg}
                    />
                  </Button>
                </FlexDiv>
              </FlexDiv>
            </>
          )}
        </FlexDiv>
        <FlexDiv $direction="column" $gap="18px">
          <FlexDiv $direction="column" $gap="8px">
            <P $fontSize="24px">Import Another Wallet</P>
            <P $color="#C8C6C8">
              Import a wallet from CoNET platform into CoNETian for easier
              management and boosted benefits!
            </P>
          </FlexDiv>
          <input
            value={newWalletPrivateKey}
            onChange={(e) => setNewWalletPrivateKey(e.target.value)}
            placeholder="Enter Private Key"
            style={{
              padding: "14px 16px",
              fontSize: "16px",
              background: "rgba(99, 99, 99, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
            }}
          />
          <Button
            $padding="18px"
            $radius="32px"
            $border="1px solid #04DAE8"
            onClick={isImportingWallet ? () => { } : handleImportWalletButton}
            disabled={isImportingWallet}
          >
            Import Wallet
          </Button>
        </FlexDiv>
      </FlexDiv>

      <ConfirmModal
        title="Import Wallet"
        message="If you import a new wallet, you will lose your current one. Are you sure you want to continue?"
        confirmButtonText="Yes"
        cancelButtonText="No"
        confirmButtonAction={handleImportWalletConfirm}
        cancelButtonAction={() => setShowImportWalletConfirmModal(false)}
        closeButtonAction={() => setShowImportWalletConfirmModal(false)}
        showConfirmModal={showImportWalletConfirmModal}
      />
    </>
  );
}
