import Main from "../../components/Main";

import face from "../../assets/White_DivineDAO_3_HQ-03.png";

import ama from "../../assets/overview/gods/ama.jpeg"
import aph from "../../assets/overview/gods/aph.jpeg"
import ra from "../../assets/overview/gods/ra.jpeg"
import gan from "../../assets/overview/gods/gan.jpeg"
import sva from "../../assets/overview/gods/sva.jpeg"
import thor from "../../assets/overview/gods/thor.jpeg"

const GodsOverview = () => {
    return <Main>
        <div className="uk-flex uk-flex-column" style={{ marginTop: "50px"}}>
            <h1 className="overview-text uk-text-center" style={{ fontSize: "60px", paddingTop: "30px"}}>Amaterasu, The Goddes of Sun</h1>
            <div className="uk-grid uk-flex ux-flex-row uk-flex-center">
                <div className="uk-width-2-3 overview-text" style={{ paddingTop: "4%", fontSize: "22px"}}>
                    <p>Amaterasu appears in Japanese mythology as the Goddess of Sun and presides over the Pantheon of Sinoistic Gods. Full name: Amaterasu-o-mi-kami, the great Goddess that makes the skies shine. She was birthed by the god Izanaki from drops of water, with which he cleansed his body after visiting the land of the dead.</p>
                    <p>All of the backgrounds we designed for Amaterasu depict associations of the Sun. We also added several Holy Artifacts that Amaterasu is traditionally associated with, pearls, a fan, the Okami bowl that contains the water drops from which she was born. We also have her holding the Yata no Kagami mirror representing honesty.</p>
                </div>
                <img src={ama} className="uk-width-1-3"/>
            </div>
            <h1 className="overview-text uk-text-center" style={{ fontSize: "60px", paddingTop: "30px"}}>Aphrodite, The Goddes of Beauty</h1>
            <div className="uk-grid uk-flex ux-flex-row uk-flex-center">
                <img src={aph} className="uk-width-1-3"/>
                <div className="uk-width-2-3 overview-text" style={{ paddingTop: "4%", fontSize: "22px"}}>Aphrodite, the Greek Goddess of beauty, was born from the foam of the ocean, as she is the daughter of the Ancient Greek God of the Seas, Poseidon. In Roman mythology, her name is Venus. As the Ancient Greek and Roman mythology and rhetoric was on the rise in Renaissance times, we see a plethora of Aphrodite’s symbolic objects and items, such as doves and flowers, which appear in some of our NFTs. We pay tribute to some of the most famous depictions of her, such as Botticelli’s birth of Venus, in the background of our images of her. Another peculiar item she bears in our images is the wine cup of eternal youth and beauty. We also tried to evoke the tenderness, love and beauty that she emanates in the eyers of her worshippers – either in legends or in the evident images.</div>
            </div>
            <h1 className="overview-text uk-text-center" style={{ fontSize: "60px", paddingTop: "30px"}}>Ra, The Lord of Light</h1>
            <div className="uk-grid uk-flex ux-flex-row uk-flex-center">
                <div className="uk-width-2-3 overview-text" style={{ paddingTop: "8%", fontSize: "22px"}}>Ra completes our trinity of Sun gods, as the Ancient Egyptian god of the Sun. He bears numerous names, including Amun-Ra or Ra-Horakhty, as he also controls order, kings and the day sky. Above his head, you can see a floating red circle – the Sun. He is just and kind, as is evident from his falcon head. More importantly he presides over the pantheon of Ancient Egyptian Gods for he is the father of all deities. He rules over all created lands – the sky, the Earth, and the underworld.</div>
                <img src={ra} className="uk-width-1-3"/>
            </div>
            <h1 className="overview-text uk-text-center" style={{ fontSize: "60px", paddingTop: "30px"}}>Ganeshu, The Lord of Learning</h1>
            <div className="uk-grid uk-flex ux-flex-row uk-flex-center">
                <img src={gan} className="uk-width-1-3"/>
                <div className="uk-width-2-3 overview-text" style={{ paddingTop: "4%", fontSize: "22px"}}>Hindu worshippers believe that the half-man, half-elephant God is a kind and light creature, full of wisdom. His elephant head represents the sapient mind of both the creature and the God. His large ears represent his willingness to listen to all creatures that come asking to him. The tusk symbolises his power, while his trunk symbolises his wisdom. The large belly and tender kindness it emanates are meant to show off his generosity and willingness to protect the Universe and its cosmic energy. The variety of items, clothes, and paintings on his head show how prevalent his popularity is among the numerous Hindu worshippers. The tiny mouse is his vahana, or vehicle, which he employs to travel.</div>   
            </div>
            <h1 className="overview-text uk-text-center" style={{ fontSize: "60px", paddingTop: "30px"}}>Svarog, The Divine Smith</h1>
            <div className="uk-grid uk-flex ux-flex-row uk-flex-center">
                <div className="uk-width-2-3 overview-text" style={{ paddingTop: "8%", fontSize: "22px"}}>Svarog is the Slavic god of fire and blacksmithing. He is the holder and creator of the Holy Fire in Slavic mythology. Therefore, we depict him surrounded by fire or wielding fire or oftentimes holding a hammer with which he created this fire. In the background you can see totem-like structure or wooden statues that Slavic tribes carved to worship their pantheon.</div>
                <img src={sva} className="uk-width-1-3"/>
            </div>
            <h1 className="overview-text uk-text-center" style={{ fontSize: "60px", paddingTop: "30px"}}>Thor, The Lord of Thunder</h1>
            <div className="uk-grid uk-flex ux-flex-row uk-flex-center" style={{marginBottom: "50px"}}>
                <img src={thor} className="uk-width-1-3"/>
                <div className="uk-width-2-3 overview-text" style={{ paddingTop: "4%", fontSize: "22px"}}>Thor takes the role of the God of Thunder in the Norse mythology. He is the son of Odin and the giant, Jord, the personification of Earth. His name is derived from the Germanic word for ‘thunder’, as he is the God that controls the thunder, which is why we show him either surrounded by and/or wielding lightnings. The main attribute Thor is always depicted with is the Mjolnir hammer that helps him create rolling thunder in the skies. Owing to the popularity that Thor has had since Viking times up until recently in mass media, we tried to stick to traditional embodiment of his image with red hair and traditional varied Viking armour.</div>
            </div>
        </div>
    </Main>
}
export default GodsOverview