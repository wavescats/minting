import styled from "@emotion/styled";
import { Button } from "@mui/material";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { MenuView, Metadata, Title } from "../components";
import { SpaceContext, Web3Context } from "../contexts";
import { usePlanetContract } from "../hooks";

const List: NextPage = () => {
  const { web3 } = useContext(Web3Context);
  const { totalSupply, tokenURI, ownerOf } = usePlanetContract(web3);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [numOfTokens, setNumOfTokens] = useState(-1); // ๋ฐํ๋ ๐ totalSupply ๊ฐ์ ๋ชป๊ฐ์ ธ์์ผ๋ฉด ์๋ฌด๊ฒ๋ ์๋ณด์ด๊ฒ -1
  const [owner, setOwner] = useState("");
  const [metadataURI, setMetadataURI] = useState("");
  const [metadataJson, setMetadataJson] = useState<any>();

  const { showPlanet, clearPlanet } = useContext(SpaceContext);

  const router = useRouter();

  useEffect(() => {
    if (web3) {
      (async () => {
        const total = await totalSupply();
        setNumOfTokens(+total);
        // total ๊ฐ์ด string ์ผ ๊ฒฝ์ฐ ์์ + ๋ถํ์ฃผ๋ฉด ์๋์ผ๋ก number๋ก ๋ฐ๊ฟ์ค๋ค

        if (currentIndex < numOfTokens) {
          // index๊ฐ์ด ๋ฐํ๋ ๋ณด๋ค ์์๊ฒฝ์ฐ ์คํ
          const tokenId = web3.utils.numberToHex(currentIndex); // ์ซ์๋ฅผ ๐ 0x0000 ๊ฐ์๊ฐ์ผ๋ก ๋ฐ๊ฟ์ค
          const uri = await tokenURI(tokenId);
          const owner = await ownerOf(tokenId);

          setOwner(owner);
          setMetadataURI(uri);
        }
      })();
    }
  }, [web3, currentIndex, numOfTokens, ownerOf, tokenURI, totalSupply]);

  useEffect(() => {
    if (metadataURI) {
      (async () => {
        const metadataQuery = await fetch(metadataURI);
        const metadata = await metadataQuery.json();

        setMetadataJson(metadata);
      })();
    }
  }, [metadataURI]);

  useEffect(() => {
    if (metadataJson && metadataJson.planetType) {
      showPlanet(metadataJson.planetType);
    }
    return () => clearPlanet();
  }, [metadataJson, showPlanet, clearPlanet]);

  const onClickPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const onClickNext = () => {
    if (currentIndex < numOfTokens - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <ListView>
      <DownMenuView>
        <Title>Planet #{currentIndex}</Title>
        {metadataJson && (
          <Metadata owner={owner} properties={metadataJson.attributes} />
        )}
        <SwitchView>
          <Button
            variant="contained"
            size="large"
            onClick={onClickPrev}
            disabled={currentIndex === 0}
          >
            Prev
          </Button>
          {numOfTokens > 0 && (
            <Counter>
              {currentIndex + 1} / {numOfTokens}
            </Counter>
          )}
          <Button
            variant="contained"
            size="large"
            onClick={onClickNext}
            disabled={currentIndex === numOfTokens - 1}
          >
            Next
          </Button>
        </SwitchView>
        <GoBackButton onClick={() => router.back()}>Go Previous</GoBackButton>
      </DownMenuView>
    </ListView>
  );
};

const ListView = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

const DownMenuView = styled(MenuView)`
  margin-top: 320px;
`;

const SwitchView = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
`;

const Counter = styled.div`
  flex: 1;
  text-align: center;
  color: #fff;
  font-size: 20px;
`;

const GoBackButton = styled(Button)`
  margin-top: 8px;
`;

export default List;
