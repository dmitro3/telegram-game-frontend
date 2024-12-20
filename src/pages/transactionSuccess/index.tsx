import { GradientButton } from "@/components/button";
import { Div, FlexDiv } from "@/components/div";
import { P } from "@/components/p";
import PageWrapper from "@/components/pageWrapper";
import { Img } from "@/utilitiy/images";
import { ReadableAssetType, useGameContext } from "@/utilitiy/providers/GameProvider";
import Image from "next/image";

const TransactionSuccess = () => {
  const { setRouter, buyItem, transferTokenDetails } = useGameContext();

  return (
    <PageWrapper>
      <Div $padding="0 10px">
        <Image src={Img.TransactionCheckImg} width={32} height={32} alt="" />
        <Div>
          <P $fontSize="45px">The transaction </P>
          <P $fontSize="45px" $color="#79F8FF">
            was successful
          </P>
        </Div>
        <Div>
          <P>Summary</P>
          <Div
            $background="#262626"
            $padding="20px"
            $radius="16px"
            $margin="10px 0 0 0"
          >
            <FlexDiv $justify="space-between">
              <P $fontSize="14px">Sent</P>
              <P $fontSize="14px">{buyItem?.price} {ReadableAssetType[transferTokenDetails ? transferTokenDetails.assetName : 'cCNTP']}</P>
            </FlexDiv>
            <FlexDiv $justify="space-between" $margin="10px 0">
              <P $fontSize="14px">GAS fee</P>
              <P $fontSize="14px">{transferTokenDetails?.gasFee} $CONET</P>
            </FlexDiv>
          </Div>
        </Div>
        <FlexDiv
          $justify="center"
          $direction="column"
          $align="center"
          $margin="50px 0 100px 0"
          $gap="5px"
        >
          {buyItem?.buyTitle ? (
            <GradientButton onClick={() => setRouter?.("/gameitem")}>
              Back to Items
            </GradientButton>
          ) : buyItem?.send ? (
            <GradientButton onClick={() => setRouter?.("/wallet")}>
              Back to My Wallet
            </GradientButton>
          ) : (
            <GradientButton onClick={() => setRouter?.("/skinstore")}>
              Back to Skins Store
            </GradientButton>
          )}

          <FlexDiv $justify="center" $align="center" $gap="5px">
            <Image src={Img.SecureImg} width={11} height={14} alt="" />
            <P $fontSize="11px" $color="#FFFFFF">
              Secure payment
            </P>
          </FlexDiv>
        </FlexDiv>
      </Div>
    </PageWrapper>
  );
};

export default TransactionSuccess;
