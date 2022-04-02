import Main from "../../components/Main";

import face from "../../assets/White_DivineDAO_3_HQ-03.png"

import nft_0_0 from "../../assets/overview/project/0_0_nft.png"
import nft_0_1 from "../../assets/overview/project/0_1_nft.png"
import nft_0_2 from "../../assets/overview/project/0_2_nft.png"

import nft_1_0 from "../../assets/overview/project/1_0_nft.png"

import nft_2_0 from "../../assets/overview/project/2_0_nft.png"
import nft_2_1 from "../../assets/overview/project/2_1_nft.png"
import nft_2_2 from "../../assets/overview/project/2_2_nft.png"

import { Link } from "react-router-dom"

const ProjectOverview = () => {
    return <Main>
        <div className="uk-flex uk-flex-column">
            <nav className="uk-navbar-container uk-navbar-transparent uk-light" data-uk-navbar>
                <div className="uk-navbar-right">
                    <div className="uk-navbar-item">
                        <Link to="/app" className="uk-button uk-button-default" style={{ backgroundColor: "#DBF501", color: "black"}}>Enter App</Link>
                        <Link to="/auction" className="uk-button uk-button-default uk-margin-left" style={{ backgroundColor: "#DBF501", color: "black"}}>Divine NFT Auction</Link>
                        <a href="https://docs.divinedao.finance/" className="uk-button uk-button-default uk-margin-left" target="_blank"
                        rel="noreferrer noopener" style={{ backgroundColor: "#DBF501", color: "black"}}>Documentation</a>
                        <a href="https://bit.ly/35rEoIb" className="uk-button uk-button-default uk-margin-left" target="_blank"
                         style={{ backgroundColor: "#DBF501", color: "black"}}>Deck</a>
                    </div>
                </div>
            </nav>
            <div className="uk-background-contain uk-height-small uk-flex-center uk-flex-center" style={{ "backgroundImage": `url('${face}')`, height: "169px", width: "139px", marginLeft: "45%" }} />
            <h1 className="uk-text-center overview-text" style={{ fontSize: "84px"}}>What are Divine Creatures?</h1>
            <div className="uk-text-center overview-text uk-padding-small" style={{fontSize: "24px"}}>The first reserve currency project that allows NFT holders to stake and earn compunding interest</div>
            <div className="uk-grid uk-flex uk-flex-center">
                <img data-src={nft_0_0} data-uk-img="" className="uk-width-medium" style={{ marginBottom: "20px"}}/>
                <img src={nft_0_1} data-uk-img="" className="uk-width-medium" style={{ marginTop: "20px"}}/>
                <img src={nft_0_2} data-uk-img="" className="uk-width-medium" style={{ marginBottom: "20px"}}/>
            </div>
            <div className="uk-grid uk-flex uk-flex-center" style={{paddingTop: "50px"}}>
                <img src={nft_1_0} className="uk-width-medium uk-width-medium@s uk-width-medium@m uk-width-large@l uk-width-large@xl"/>
                <div className="uk-width-1-3" style={{ marginTop: "30px"}}>
                    <h3 className="overview-text" style={{ fontSize: "70px"}}>The NFTs</h3>
                    <ul className="overview-text">
                        <li style={{paddingTop: "30px", fontFamily: "Rany", fontSize: "24px"}}>Carries a purchasable allocation of $EGIS token at $1</li>
                        <li style={{paddingTop: "30px", fontFamily: "Rany", fontSize: "24px"}}>10% of NFTs receive free allocation</li>
                        <li style={{paddingTop: "30px", fontFamily: "Rany", fontSize: "24px"}}>Grants Staking and Bonding boosts</li>
                    </ul>
                </div>
            </div>
            <div className="uk-grid uk-flex uk-flex-center">
                <div className="uk-width-1-3" style={{ marginTop: "50px"}}>
                    <h3 className="overview-text" style={{ fontSize: "70px"}}>$EGIS Token</h3>
                    <ul className="overview-text">
                        <li style={{paddingTop: "30px", fontFamily: "Rany", fontSize: "18px"}}>Upon succesful presale, $EGIS will launch at {'>'}$2.5 with staking and bonding capabilities</li>
                        <li style={{paddingTop: "30px", fontFamily: "Rany", fontSize: "18px"}}>Open Treasury - Exchange $EGIS for its backing assets (RFV) if the price falls below its backing</li>
                        <li style={{paddingTop: "30px", fontFamily: "Rany", fontSize: "18px"}}>Staking and treasury bonding for 3 months, after which all staking and bonding shall cease</li>
                        <li style={{paddingTop: "30px", fontFamily: "Rany", fontSize: "18px"}}>EGIS RFV will be backed by yield bearing assets including those from the Alliance accelerator</li>
                    </ul>
                </div>
                <div style={{ backgroundColor: "white", height: "370px", width: "322px", marginLeft: "5%", borderRadius: "50%", marginTop: "8%"}}>
                    <div className="uk-background-contain" style={{ "backgroundImage": `url('${face}')`, height: "360px", width: "280px"}} />
                </div>
            </div>
            <h1 className="uk-text-center overview-text" style={{paddingTop: "50px", fontSize: "84px"}}>Auction</h1>
            <div className="uk-flex uk-flex-center" style={{paddingBottom: "20px"}}>
                <div className="overview-text uk-text-center uk-width-2-3" style={{fontSize: "20px"}}>The fairest launch yet. Each NFT carries a purchasable allocation for $EGIS. All NFTs enter a lottery, where 80% of NFT holders are winners and you have a 10% chance of getting tokens for free.</div>
            </div>
            <div className="uk-grid uk-flex uk-flex-center">
                <img data-src={nft_2_0} data-uk-img="" className="uk-width-large"/>
                <img src={nft_2_1} data-uk-img="" className="uk-width-large"/>
                <img src={nft_2_2} data-uk-img="" className="uk-width-large"/>
            </div>
            <div className="uk-flex uk-flex-center uk-padding">
                <Link to="/auction" className="uk-button uk-button-default uk-width-1-3" style={{ color: "black", fontFamily: "Rany", fontSize: "20px"}}>
                    <div className="uk-padding-small">
                        Divine NFT Auction
                    </div>
                </Link>
            </div>
        </div>
    </Main>
}

export default ProjectOverview