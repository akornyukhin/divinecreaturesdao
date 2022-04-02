import gem from "../../../assets/emoji/gem-stone.png"
import angel from "../../../assets/emoji/baby-angel.png"
import mermaid from "../../../assets/emoji/mermaid.png"
import * as React from "react"
import { DivineTiers } from "../../../helpers/types"

export const EmojiSpan = (emoji: string) =>
    <span style={{ height: "24px", width: "36px" }}>
        <div className="uk-background-contain uk-flex-left uk-height-max-small uk-width-small"
             style={{ backgroundImage: `url(${emoji})` }}>&nbsp;</div>
    </span>

interface IEmojiDiv {
    emoji: string
}
export const EmojiDiv = ({ emoji} : IEmojiDiv) =>
    <div style={{ height: "24px", width: "36px" }}>
        <div className="uk-background-contain uk-flex-left uk-height-max-small uk-width-small"
             style={{ backgroundImage: `url(${emoji})` }}>&nbsp;</div>
    </div>

export const EmojiGod = () => <EmojiDiv emoji={gem} />
export const EmojiDeity = () => <EmojiDiv emoji={angel} />
export const EmojiDemigod = () => <EmojiDiv emoji={mermaid} />

interface ITierImageProps {
    tier: DivineTiers
}
export const TierImage = ({tier}: ITierImageProps) => tier === DivineTiers.GOD ? <EmojiGod />
    : tier === DivineTiers.DEITY ? <EmojiDeity />
    : tier === DivineTiers.DEMIGOD ? <EmojiDemigod />
    : <div>&nbsp;</div> // TODO: {throw new Error(`Unsupported God Tier ${tier}`)}


const SingleQualitySection = (tier: string, emoji: string, bonus: string) =>
    <div>
        <div className="uk-flex uk-flex-row">
            {EmojiSpan(emoji)}
            <span>{tier} tier</span>
        </div>
        <div>{bonus}</div>
    </div>

interface IQualitySectionProps {
    quality: number;
}

export const QualitySection = ({ quality }: IQualitySectionProps) =>
    quality === 3
        ? SingleQualitySection("God", gem, "5% Staking + 5% Bonding Boosts")
        : quality === 2
            ? SingleQualitySection("Deity", angel, "2.5% Staking + 5% Bond Boosts")
            : quality === 1
                ? SingleQualitySection("Demigod", mermaid, "2.5% Bonding Boost")
                : <span>Quality #{quality}</span>
