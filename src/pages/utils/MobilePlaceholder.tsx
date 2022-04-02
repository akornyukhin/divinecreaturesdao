import Main from "../../components/Main";

import face from "../../assets/White_DivineDAO_3_HQ-03.png"

const MobilePlaceholder = () => {
    return <Main>
       <div className="uk-flex uk-flex-column">
            <div className="uk-flex uk-flex-column ux-text-center">
                <p className="overview-text" style={{ fontSize: "48px", textAlign: "center", marginTop: "70px"}}>Hi Creature!</p>
                <p className="overview-text" style={{ fontSize: "40px", textAlign: "center"}}>Mobile version is not yet supported. For best experience use desktop.</p>
            </div>
            <div className="uk-background-contain uk-height-small uk-flex-center uk-flex-center" style={{ "backgroundImage": `url('${face}')`, height: "150px", width: "150px", marginLeft: "25%", marginTop: "20px"}} />
       </div>
    </Main>
}

export default MobilePlaceholder