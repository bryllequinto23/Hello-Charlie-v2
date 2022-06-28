import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect, disconnect } from "./redux/blockchain/blockchainActions2";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import keccak256 from "keccak256";
import MerkleTree from "merkletreejs";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledButton2 = styled.button`
  padding: 15px 30px;
  border-radius: 10px;
  border: none;
  background-color: var(--secondary);
  font-weight: bold;
  color: var(--accent-text);
  width: 40%;
  font-size: 30px;
  cursor: pointer;

  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }

  :disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  @media (max-width: 767px) {
    width: 60%;
    font-size: 35px;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton2 = styled.button`
  border-radius: 100%;
  border: 1px solid;
  background-color: transparent;
  font-weight: bold;
  font-size: 25px;
  color: var(--secondary-text);
  width: 50px;
  height: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (max-width: 767px) {
    flex-direction: column-reverse;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--accent-text);
  text-decoration: none;
`;

function App() {

  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(``);
  const [mintAmount, setMintAmount] = useState(1);
  const [isErrorMsg, setErrorMsg] = useState(0);
  const [isConnected, setConnected] = useState(false);
  const [isEligible, setEligibile] = useState(false);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    MAX_MINT_WL: 0,
    MAX_MINT_OG: 0,
    MAX_MINT_PUB: 0,
    WEI_COST: 0,
    WEI_COST_WL: 0,
    WEI_COST_OG: 0,
    DISPLAY_COST: 0,
    DISPLAY_COST_WL: 0,
    DISPLAY_COST_OG: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
    WL: [],
    OG: []
  });

  const claimNFTs = () => {
    // console.log("Cost: ", totalCostWei);
    // console.log("Gas limit: ", totalGasLimit);
    setErrorMsg(0);
    setFeedback(`Minting your Charlie...`);
    setClaimingNft(true);
    checkStatus();
  };

  const checkStatus = () => {
    blockchain.smartContract.methods
    .pause()
    .call()
    .then((paused) => {
      if (paused) {
        alert("Minting is paused");
      } else {
        checkWhitelistSale();
      }
    });
  }

  const checkWhitelistSale = () => {
    // check value of whitelist sale (true or false)
    blockchain.smartContract.methods
    .whiteListSale()
    .call()
    .then((isWhitelistSale) => {
      if (isWhitelistSale) {
        verifyWLSale();
      } else {
        verifyPSale();
      }
    });
  };

  const verifyWLSale = () => {
    const totSupply = data.totalSupply;
    const wlTotal = data.wlTotal;
    const maxWl = CONFIG.MAX_MINT_WL;
    const maxSupply = CONFIG.MAX_SUPPLY;

    const newSupply = totSupply + mintAmount;
    const newWlTotal = wlTotal + mintAmount;

    if (newSupply > maxSupply) {
      alert("Beyond max supply.")
    } else if (newWlTotal > maxWl) {
      alert("You have reached the maximum amount of mints.")
    } else {
      checkEligibility();
      
      if (!isEligible) {
        alert("You are not whitelisted.")
      } else {
        whitelistMint();
      }
    }
  }

  const verifyPSale = () => {
    const totSupply = data.totalSupply;
    const pubTotal = data.pubTotal;
    const maxPub = CONFIG.MAX_MINT_PUB;
    const maxSupply = CONFIG.MAX_SUPPLY;

    const newSupply = totSupply + mintAmount;
    const newPubTotal = pubTotal + mintAmount;

    if (newSupply > maxSupply) {
      alert("Beyond max supply.")
    } else if (newPubTotal > maxPub) {
      alert("You have reached the maximum amount of mints.")
    } else {
      publicMint();
    }
  }

  const whitelistMint = () => {
    let cost = CONFIG.WEI_COST_WL;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);

    const l = CONFIG.WL.map(x => keccak256(x));
    const tree = new MerkleTree(l, keccak256, { sortPairs: true });
    const buf2hex = x => '0x' + x.toString('hex')

    console.log(buf2hex(tree.getRoot()))

    const leaf = keccak256(blockchain.account);
    const proof = tree.getProof(leaf).map(x => buf2hex(x.data));

    blockchain.smartContract.methods
      .whitelistMint(proof, mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setErrorMsg(1);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
        setTimeout(() => setFeedback(``), 4000);
      })
      .then((receipt) => {
        console.log(receipt);
        setErrorMsg(0);
        setFeedback(
          `Your Charlie has been minted. Visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
        setTimeout(() => setFeedback(``), 4000);
      });
  };

  const publicMint = () => {
    let cost = CONFIG.WEI_COST; // 1 ETH OR MATIC = 1000000000000000000 WEI
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);

    blockchain.smartContract.methods
      .publicMint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setErrorMsg(1);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
        setTimeout(() => setFeedback(``), 4000);
      })
      .then((receipt) => {
        console.log(receipt);
        setErrorMsg(0);
        setFeedback(
          `Your Charlie has been minted. Visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
        setTimeout(() => setFeedback(``), 4000);
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let totSupply = +(data.totalSupply);
    let tempTotal = mintAmount + totSupply;
    let newMintAmount;

    if (tempTotal === CONFIG.MAX_SUPPLY) {
      newMintAmount = mintAmount;
    } else if (blockchain.wlSale && (data.wlTotal + mintAmount) > MAX_MINT_WL) {
      newMintAmount = mintAmount;
    } else if (blockchain.pSale && (data.pubTotal + mintAmount) > MAX_MINT_PUB) {
      newMintAmount = mintAmount;
    } else {
      newMintAmount = mintAmount + 1;
    }
    
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      setConnected(true);
      dispatch(fetchData(blockchain.account));
      if (blockchain.wlSale) {
        checkEligibility();
      }
    } else {
      setConnected(false);
    }
  };

  const checkEligibility = () => {
    console.log(blockchain.account)
    const isWl = CONFIG.WL.map(elem => elem.toLowerCase()).includes(blockchain.account.toLowerCase());

    if (isWl) {
      setEligibile(true);
    } else {
      setEligibile(false);
    }
  }

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);


  return (
    <s.Screen2>
      <s.Container2 flex={2} image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg6.png" : null}>
      </s.Container2>
      { isConnected && (blockchain.paused || (blockchain.wlSale && !isEligible) || (!blockchain.paused && !blockchain.wlSale && !blockchain.pSale)) ? (
        <s.Container3 flex={2}>
          <s.Container flex={2} jc={"center"} ai={"center"}>
            <s.TextTitle style={{
              textAlign: "center",
              fontSize: 50,
              fontWeight: "bold",
              color: "var(--primary-text)",}}>
              { blockchain.paused || (!blockchain.paused && !blockchain.wlSale && !blockchain.pSale) ? 
                "Minting is not allowed at the moment" : "You are not whitelisted." }
            </s.TextTitle>
          </s.Container>
        </s.Container3>
      ) : (
        <s.Container3 flex={2}>
          <s.Container flex={2} jc={"center"} ai={"center"}>
            { !isConnected ? (
              <s.Container ai={"center"} jc={"center"}>
                <s.SpacerSmall />
                <StyledButton2 onClick={(e) => {
                  e.preventDefault();
                  dispatch(connect());
                  getData();}}>
                  CONNECT
                </StyledButton2>
                { blockchain.errorMsg !== "" ? (
                  <>
                    <s.SpacerSmall />
                    <s.TextDescription style={{
                      textAlign: "center",
                      color: "var(--err-text)",
                      fontWeight: "bold"}}>
                      {blockchain.errorMsg}
                    </s.TextDescription>
                  </>
                ) : null }
              </s.Container>
            ) : (
              <>
                <StyledButton2 onClick={(e) => {
                  e.preventDefault();
                  disconnect();}}>
                  DISCONNECT
                </StyledButton2>
                <s.TextTitle style={{
                  textAlign: "center",
                  fontSize: 50,
                  fontWeight: "bold",
                  color: "var(--primary-text)",}}>
                  {data.totalSupply} / {CONFIG.MAX_SUPPLY}
                </s.TextTitle>
                {/* <s.TextDescription style={{
                  textAlign: "center",
                  color: "var(--accent-text)",}}>
                  <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                    {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
                  </StyledLink>
                </s.TextDescription> */}
                <s.SpacerSmall />
                { Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
                  <>
                    <s.TextTitle style={{ textAlign: "center", color: "var(--accent-text)" }}>
                      The sale has ended.
                    </s.TextTitle>
                    <s.TextDescription style={{ textAlign: "center", color: "var(--accent-text)" }}>
                      You can still find {CONFIG.NFT_NAME} on
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                      {CONFIG.MARKETPLACE}
                    </StyledLink>
                  </>
                ) : (
                  <>
                    <s.TextTitle style={{ textAlign: "center", color: "var(--primary-text)" }}>
                        1 Charlie = { blockchain.wlSale ? CONFIG.DISPLAY_COST_WL : CONFIG.DISPLAY_COST}{" "}
                        {CONFIG.NETWORK.SYMBOL}.
                    </s.TextTitle>
                    {/* <s.SpacerXSmall />
                    <s.TextDescription style={{ textAlign: "center", color: "var(--accent-text)" }}>
                      Excluding gas fees.
                    </s.TextDescription> */}
                    <s.SpacerSmall />
                    { feedback !== "" ? (
                      <>
                        <s.TextDescription style={{
                        textAlign: "center",
                        color: isErrorMsg === 1 ? "var(--err-text)" : "var(--primary-text)",
                        fontWeight: "bold"}}>
                        {feedback}
                        </s.TextDescription>
                        <s.SpacerSmall />
                      </>
                    ) : null }
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton2 style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}>
                        -
                      </StyledRoundButton2>
                      <s.SpacerMedium />
                      <s.TextDescription style={{
                        textAlign: "center",
                        color: "var(--primary-text)",
                        fontWeight: "bold",
                        fontSize: "35px"}}>
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton2 disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}>
                        +
                      </StyledRoundButton2>
                    </s.Container>
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton2 disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}>
                        {claimingNft ? "MINTING..." : "MINT"}
                      </StyledButton2>
                    </s.Container>
                  </>
                )}
              </>
            )}
          </s.Container>
        </s.Container3>
      )}
    </s.Screen2>
  )

  return {/* <s.Container flex={2} jc={"center"} ai={"center"}>
  <s.TextTitle style={{
    textAlign: "center",
    fontSize: 50,
    fontWeight: "bold",
    color: "var(--accent-text)",}}>
    {data.totalSupply} / {CONFIG.MAX_SUPPLY}
  </s.TextTitle>
  <s.TextDescription style={{
    textAlign: "center",
    color: "var(--primary-text)",}}>
    <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
      {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
    </StyledLink>
  </s.TextDescription>
  <s.SpacerSmall/> */}
  {/* { Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
    <>
      <s.TextTitle style={{ textAlign: "center", color: "var(--accent-text)" }}>
        The sale has ended.
      </s.TextTitle>
      <s.TextDescription style={{ textAlign: "center", color: "var(--accent-text)" }}>
        You can still find {CONFIG.NFT_NAME} on
      </s.TextDescription>
      <s.SpacerSmall/>
      <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
        {CONFIG.MARKETPLACE}
      </StyledLink>
    </>
    ) : (
    <>
    </>
    )
  } */}
{/* </s.Container> */}

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg4.png" : null}
      >
        {/* <a href={CONFIG.MARKETPLACE_LINK}>
          <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
        </a> */}
        <s.SpacerSmall />
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
          {/* <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg alt={"example"} src={"/config/images/example.gif"} />
          </s.Container> */}
          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "transparent",
              // padding: 24,
              // borderRadius: 24,
              // border: "4px dashed var(--secondary)",
              // boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
            }}
          >
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
            <span
              style={{
                textAlign: "center",
              }}
            >
              {/* <StyledButton
                onClick={(e) => {
                  window.open("/config/roadmap.pdf", "_blank");
                }}
                style={{
                  margin: "5px",
                }}
              >
                Roadmap
              </StyledButton>
              <StyledButton
                style={{
                  margin: "5px",
                }}
                onClick={(e) => {
                  window.open(CONFIG.MARKETPLACE_LINK, "_blank");
                }}
              >
                {CONFIG.MARKETPLACE}
              </StyledButton> */}
            </span>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  1 Charlie = {CONFIG.DISPLAY_COST}{" "}
                  {CONFIG.NETWORK.SYMBOL}.
                </s.TextTitle>
                <s.SpacerXSmall />
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  Excluding gas fees.
                </s.TextDescription>
                <s.SpacerSmall />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      Connect to the {CONFIG.NETWORK.NAME} network
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {feedback}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "BUSY" : "BUY"}
                      </StyledButton>
                    </s.Container>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
          </s.Container>
          <s.SpacerLarge />
          {/* <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg
              alt={"example"}
              src={"/config/images/example.gif"}
              style={{ transform: "scaleX(-1)" }}
            />
          </s.Container> */}
        </ResponsiveWrapper>
        <s.SpacerMedium />
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            Please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
            Once you make the purchase, you cannot undo this action.
          </s.TextDescription>
          <s.SpacerSmall />
          {/* <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            We have set the gas limit to {CONFIG.GAS_LIMIT} for the contract to
            successfully mint your NFT. We recommend that you don't lower the
            gas limit.
          </s.TextDescription> */}
        </s.Container>
      </s.Container>
    </s.Screen>
  );
}

export default App;
