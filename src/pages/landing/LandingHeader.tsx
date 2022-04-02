import face from "../../assets/White_DivineDAO_3_HQ-03.png"

const LandingHeader = () => {
    return <header>
        <nav className="uk-navbar-container uk-navbar-transparent uk-light" data-uk-navbar>
            <div className="uk-navbar-left">
                <ul className="uk-navbar-nav">
                    <li className="uk-active">
                        <a href="#" className="uk-flex uk-flex-column">
                            <div className="uk-background-contain uk-height-small "
                                 style={{ "backgroundImage": `url('${face}')`, height: "50px", width: "50px" }} />
                            <h4 className="uk-text-uppercase uk-text-uppercase uk-text-bolder uk-text-small uk-text-center uk-margin-remove-vertical">Divine
                                Creatures</h4>
                        </a>
                    </li>
                </ul>
            </div>
            <div className="uk-navbar-right">
                <ul className="uk-navbar-nav">
                    <li>
                        <a href="#" className="evil-text">Social</a>
                        <div className="uk-navbar-dropdown uk-background-secondary">
                            <ul className="uk-nav uk-navbar-dropdown-nav uk-light">
                                {/* <li><a target="_blank" rel="noopener noreferrer" href="https://github.com/"><span className="uk-margin-small-right" uk-icon="icon: github"></span> Github</a></li> */}
                                <li><a target="_blank" rel="noopener noreferrer"
                                       href="https://twitter.com/DCreaturesDAO" className="evil-text"><span
                                    className="uk-margin-small-right" uk-icon="icon: twitter"></span> Twitter</a></li>
                                {/* <li><a href="#"><span className="uk-margin-small-right" uk-icon="icon: tumblr"></span> Telegram</a></li> */}
                                <li><a target="_blank" rel="noopener noreferrer"
                                       href="https://discord.gg/dcdao" className="evil-text"><span
                                    className="uk-margin-small-right" uk-icon="icon: discord"></span> Discord</a></li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </div>
        </nav>
    </header>
}
export default LandingHeader
